import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Имя: минимум 2 символа';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Неверный email';
    if (!form.password || form.password.length < 6) e.password = 'Пароль: минимум 6 символов';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Ошибка регистрации' });
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3447 100%)',
    }}>
      <div style={{ width: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>Регистрация</h1>
        </div>
        <div className="card">
          {errors.general && <div className="alert alert-error">{errors.general}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Полное имя</label>
              <input placeholder="Иванов Иван" value={form.name} onChange={set('name')} />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="ivan@mail.ru" value={form.email} onChange={set('email')} />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Телефон (необязательно)</label>
              <input placeholder="+7-900-000-0000" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" placeholder="Минимум 6 символов" value={form.password} onChange={set('password')} />
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Зарегистрироваться'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6b7280' }}>
            Есть аккаунт? <Link to="/login" style={{ color: '#1a56db' }}>Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
