import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Заполните все поля');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3447 100%)',
    }}>
      <div style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>ЖКХ Система</h1>
          <p style={{ color: '#8892a4', marginTop: 4 }}>Учёт коммунальных ресурсов</p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>Вход в систему</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="admin@zhkh.ru" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" placeholder="••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Войти'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 12, background: '#f3f4f6', borderRadius: 8, fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Тестовые аккаунты:</div>
            {[
              ['admin@zhkh.ru', 'admin123', '👑 Администратор'],
              ['manager@zhkh.ru', 'manager123', '🔧 Менеджер'],
              ['anna@mail.ru', 'resident123', '🏠 Жилец (Анна)'],
            ].map(([email, pass, label]) => (
              <button key={email} onClick={() => fillDemo(email, pass)}
                style={{ display: 'block', background: 'none', border: 'none', color: '#1a56db', cursor: 'pointer', marginBottom: 4, fontSize: 12 }}>
                {label}: {email}
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6b7280' }}>
            Нет аккаунта? <Link to="/register" style={{ color: '#1a56db' }}>Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
