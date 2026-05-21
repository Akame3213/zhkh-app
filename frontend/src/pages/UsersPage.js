import React, { useEffect, useState } from 'react';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { admin: 'Администратор', manager: 'Менеджер', resident: 'Жилец' };

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'resident', password: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '' });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role };
    if (form.password) payload.password = form.password;
    try {
      await api.put(`/users/${editUser.id}`, payload);
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleToggle = async (id) => {
    if (!window.confirm('Изменить статус пользователя?')) return;
    await api.patch(`/users/${id}/toggle`);
    load();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">👥 Пользователи</div>
        <div style={{ color: '#6b7280', fontSize: 13 }}>Всего: {users.length}</div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Регистрация</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td style={{ fontSize: 13 }}>{u.email}</td>
                <td style={{ fontSize: 13 }}>{u.phone || '—'}</td>
                <td><span className={`badge badge-${u.role}`}>{ROLE_LABELS[u.role]}</span></td>
                <td>
                  <span className={`badge badge-${u.isActive ? 'paid' : 'overdue'}`}>
                    {u.isActive ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#6b7280' }}>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>✏️</button>
                  {user?.role === 'admin' && u.id !== user.id && (
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggle(u.id)}
                    >
                      {u.isActive ? '🔒' : '🔓'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && editUser && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Редактировать пользователя</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Имя</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Роль</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="resident">Жилец</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Новый пароль (оставьте пустым, чтобы не менять)</label>
                <input type="password" placeholder="••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
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
