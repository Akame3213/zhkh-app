import React, { useEffect, useState } from 'react';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const TYPE_LABELS = {
  cold_water: '💧 Хол. вода',
  hot_water: '🔥 Гор. вода',
  electricity: '⚡ Электричество',
  gas: '🔵 Газ',
  heat: '♨️ Отопление',
};

const EMPTY = { serialNumber: '', type: 'cold_water', tariff: '', apartmentId: '', installedAt: '', nextCheckDate: '' };

export default function MetersPage() {
  const { user } = useAuth();
  const [meters, setMeters] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = ['admin', 'manager'].includes(user?.role);

  const load = async () => {
    const [m, a] = await Promise.all([api.get('/meters'), api.get('/apartments')]);
    setMeters(m.data);
    setApartments(a.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setModal(true); };
  const openEdit = (m) => { setForm({ ...m, apartmentId: m.apartmentId || '' }); setEditId(m.id); setError(''); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.serialNumber || !form.apartmentId || !form.tariff) return setError('Заполните обязательные поля');
    if (parseFloat(form.tariff) < 0) return setError('Тариф не может быть отрицательным');
    try {
      if (editId) await api.put(`/meters/${editId}`, form);
      else await api.post('/meters', form);
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить счётчик?')) return;
    await api.delete(`/meters/${id}`);
    load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📟 Счётчики</div>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Добавить счётчик</button>}
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Серийный номер</th>
              <th>Тип</th>
              <th>Тариф</th>
              <th>Квартира</th>
              <th>Поверка до</th>
              <th>Статус</th>
              {isAdmin && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {meters.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>Нет счётчиков</td></tr>
            )}
            {meters.map(m => (
              <tr key={m.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.serialNumber}</td>
                <td>{TYPE_LABELS[m.type] || m.type}</td>
                <td>{parseFloat(m.tariff).toLocaleString('ru-RU')} ₽/{m.unit}</td>
                <td>{m.apartment?.address}, кв. {m.apartment?.apartmentNumber}</td>
                <td>{m.nextCheckDate || '—'}</td>
                <td>
                  <span className={`badge badge-${m.isActive ? 'paid' : 'overdue'}`}>
                    {m.isActive ? 'Активен' : 'Отключён'}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-secondary btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(m)}>✏️</button>
                    {user?.role === 'admin' && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>🗑️</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Редактировать счётчик' : 'Добавить счётчик'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Серийный номер *</label>
                <input placeholder="CW-2024-001" value={form.serialNumber} onChange={set('serialNumber')} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Тип *</label>
                  <select value={form.type} onChange={set('type')}>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Тариф (₽/ед.) *</label>
                  <input type="number" step="0.01" min="0" placeholder="42.30" value={form.tariff} onChange={set('tariff')} />
                </div>
              </div>
              <div className="form-group">
                <label>Квартира *</label>
                <select value={form.apartmentId} onChange={set('apartmentId')}>
                  <option value="">— выберите квартиру —</option>
                  {apartments.map(a => (
                    <option key={a.id} value={a.id}>{a.address}, кв. {a.apartmentNumber}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Дата установки</label>
                  <input type="date" value={form.installedAt} onChange={set('installedAt')} />
                </div>
                <div className="form-group">
                  <label>Следующая поверка</label>
                  <input type="date" value={form.nextCheckDate} onChange={set('nextCheckDate')} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
