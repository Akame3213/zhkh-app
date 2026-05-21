import React, { useEffect, useState } from 'react';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const EMPTY = { address: '', apartmentNumber: '', floor: '', area: '', residents: 1, userId: '' };

export default function ApartmentsPage() {
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = ['admin', 'manager'].includes(user?.role);

  const load = async () => {
    const [a, u] = await Promise.all([
      api.get('/apartments'),
      isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
    ]);
    setApartments(a.data);
    setUsers(u.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setModal(true); };
  const openEdit = (a) => { setForm({ ...a, userId: a.userId || '' }); setEditId(a.id); setError(''); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.address || !form.apartmentNumber) return setError('Адрес и номер обязательны');
    try {
      if (editId) {
        await api.put(`/apartments/${editId}`, form);
      } else {
        await api.post('/apartments', form);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить квартиру?')) return;
    await api.delete(`/apartments/${id}`);
    load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏠 Квартиры</div>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Добавить квартиру</button>}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Адрес</th>
              <th>№ кв.</th>
              <th>Этаж</th>
              <th>Площадь</th>
              <th>Жильцов</th>
              <th>Жилец</th>
              {isAdmin && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {apartments.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>Нет квартир</td></tr>
            )}
            {apartments.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.address}</td>
                <td>{a.apartmentNumber}</td>
                <td>{a.floor || '—'}</td>
                <td>{a.area ? `${a.area} м²` : '—'}</td>
                <td>{a.residents}</td>
                <td>{a.user?.name || <span style={{ color: '#6b7280' }}>Не назначен</span>}</td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-secondary btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(a)}>✏️</button>
                    {user?.role === 'admin' && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>🗑️</button>}
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
              <div className="modal-title">{editId ? 'Редактировать квартиру' : 'Добавить квартиру'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Адрес *</label>
                <input placeholder="ул. Ленина, д. 1" value={form.address} onChange={set('address')} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Номер квартиры *</label>
                  <input placeholder="42" value={form.apartmentNumber} onChange={set('apartmentNumber')} />
                </div>
                <div className="form-group">
                  <label>Этаж</label>
                  <input type="number" placeholder="5" value={form.floor} onChange={set('floor')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Площадь (м²)</label>
                  <input type="number" step="0.01" placeholder="65.5" value={form.area} onChange={set('area')} />
                </div>
                <div className="form-group">
                  <label>Кол-во жильцов</label>
                  <input type="number" min="1" value={form.residents} onChange={set('residents')} />
                </div>
              </div>
              {users.length > 0 && (
                <div className="form-group">
                  <label>Жилец</label>
                  <select value={form.userId} onChange={set('userId')}>
                    <option value="">— не назначен —</option>
                    {users.filter(u => u.role === 'resident').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
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
