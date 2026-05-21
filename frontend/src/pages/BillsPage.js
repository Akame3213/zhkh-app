import React, { useEffect, useState } from 'react';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = { pending: 'Ожидает', paid: 'Оплачен', overdue: 'Просрочен' };

export default function BillsPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ apartmentId: '', period: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const isAdmin = ['admin', 'manager'].includes(user?.role);

  const load = async () => {
    const [b, a] = await Promise.all([api.get('/bills'), api.get('/apartments')]);
    setBills(b.data);
    setApartments(a.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.apartmentId || !form.period) return setError('Заполните все поля');
    try {
      await api.post('/bills/generate', form);
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка генерации');
    }
  };

  const handlePay = async (id) => {
    if (!window.confirm('Отметить счёт как оплаченный?')) return;
    await api.post(`/bills/${id}/pay`);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить счёт?')) return;
    await api.delete(`/bills/${id}`);
    load();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">💳 Счета на оплату</div>
        {isAdmin && <button className="btn btn-primary" onClick={() => { setForm({ apartmentId: '', period: '' }); setError(''); setModal(true); }}>+ Сформировать счёт</button>}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Период</th>
              <th>Квартира</th>
              <th>Хол. вода</th>
              <th>Гор. вода</th>
              <th>Электр.</th>
              <th>Газ</th>
              <th>Отопление</th>
              <th>Итого</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>Нет счетов</td></tr>
            )}
            {bills.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>{b.period}</td>
                <td style={{ fontSize: 12 }}>{b.apartment?.address}, кв. {b.apartment?.apartmentNumber}</td>
                <td>{parseFloat(b.coldWaterAmount).toFixed(2)} ₽</td>
                <td>{parseFloat(b.hotWaterAmount).toFixed(2)} ₽</td>
                <td>{parseFloat(b.electricityAmount).toFixed(2)} ₽</td>
                <td>{parseFloat(b.gasAmount).toFixed(2)} ₽</td>
                <td>{parseFloat(b.heatAmount).toFixed(2)} ₽</td>
                <td style={{ fontWeight: 700 }}>{parseFloat(b.totalAmount).toLocaleString('ru-RU')} ₽</td>
                <td><span className={`badge badge-${b.status}`}>{STATUS_LABELS[b.status]}</span></td>
                <td style={{ display: 'flex', gap: 4 }}>
                  {b.status !== 'paid' && (
                    <button className="btn btn-success btn-sm" onClick={() => handlePay(b.id)}>✓</button>
                  )}
                  {isAdmin && user?.role === 'admin' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>🗑️</button>
                  )}
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
              <div className="modal-title">Сформировать счёт</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="alert alert-info" style={{ fontSize: 12 }}>
              Счёт формируется на основе показаний счётчиков за выбранный период. Убедитесь, что показания внесены.
            </div>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label>Квартира *</label>
                <select value={form.apartmentId} onChange={e => setForm({ ...form, apartmentId: e.target.value })}>
                  <option value="">— выберите квартиру —</option>
                  {apartments.map(a => (
                    <option key={a.id} value={a.id}>{a.address}, кв. {a.apartmentNumber}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Период (ГГГГ-ММ) *</label>
                <input type="month" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">Сформировать</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
