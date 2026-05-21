import React, { useEffect, useState } from 'react';
import api from '../hooks/useApi';

const TYPE_LABELS = {
  cold_water: '💧 Хол. вода', hot_water: '🔥 Гор. вода',
  electricity: '⚡ Электр.', gas: '🔵 Газ', heat: '♨️ Отопление',
};

const EMPTY = { meterId: '', value: '', readingDate: new Date().toISOString().slice(0, 10), note: '' };

export default function ReadingsPage() {
  const [readings, setReadings] = useState([]);
  const [meters, setMeters] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterMeter, setFilterMeter] = useState('');

  const load = async () => {
    const [r, m] = await Promise.all([api.get('/readings'), api.get('/meters')]);
    setReadings(r.data);
    setMeters(m.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.meterId || !form.value || !form.readingDate) return setError('Заполните обязательные поля');
    if (parseFloat(form.value) < 0) return setError('Показание не может быть отрицательным');
    try {
      await api.post('/readings', form);
      setModal(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить показание?')) return;
    await api.delete(`/readings/${id}`);
    load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const filtered = filterMeter ? readings.filter(r => r.meterId === parseInt(filterMeter)) : readings;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📝 Показания счётчиков</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={filterMeter} onChange={e => setFilterMeter(e.target.value)} style={{ width: 260 }}>
            <option value="">Все счётчики</option>
            {meters.map(m => (
              <option key={m.id} value={m.id}>{m.serialNumber} — {TYPE_LABELS[m.type]}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(''); setModal(true); }}>+ Внести показание</button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Счётчик</th>
              <th>Тип</th>
              <th>Адрес</th>
              <th>Показание</th>
              <th>Пред. показание</th>
              <th>Расход</th>
              <th>Примечание</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>Нет показаний</td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.readingDate}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.meter?.serialNumber}</td>
                <td>{TYPE_LABELS[r.meter?.type] || r.meter?.type}</td>
                <td style={{ fontSize: 12 }}>{r.meter?.apartment?.address}, кв. {r.meter?.apartment?.apartmentNumber}</td>
                <td style={{ fontWeight: 600 }}>{parseFloat(r.value).toFixed(3)} {r.meter?.unit}</td>
                <td style={{ color: '#6b7280' }}>{r.previousValue ? parseFloat(r.previousValue).toFixed(3) : '—'}</td>
                <td style={{ color: '#0e9f6e', fontWeight: 600 }}>{r.consumption ? `+${parseFloat(r.consumption).toFixed(3)}` : '—'}</td>
                <td style={{ fontSize: 12, color: '#6b7280' }}>{r.note || '—'}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Внести показание</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Счётчик *</label>
                <select value={form.meterId} onChange={set('meterId')}>
                  <option value="">— выберите счётчик —</option>
                  {meters.filter(m => m.isActive).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.serialNumber} — {TYPE_LABELS[m.type]} ({m.apartment?.address}, кв. {m.apartment?.apartmentNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Показание *</label>
                  <input type="number" step="0.001" min="0" placeholder="1234.567" value={form.value} onChange={set('value')} />
                </div>
                <div className="form-group">
                  <label>Дата *</label>
                  <input type="date" value={form.readingDate} onChange={set('readingDate')} />
                </div>
              </div>
              <div className="form-group">
                <label>Примечание</label>
                <textarea rows={2} placeholder="Необязательно" value={form.note} onChange={set('note')} />
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
