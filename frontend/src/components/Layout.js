import React, { useState, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useWebSocket from '../hooks/useWebSocket';

const NAV = [
  { to: '/', label: '📊 Главная', exact: true },
  { to: '/apartments', label: '🏠 Квартиры' },
  { to: '/meters', label: '📟 Счётчики' },
  { to: '/readings', label: '📝 Показания' },
  { to: '/bills', label: '💳 Счета' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const onWsMessage = useCallback((data) => {
    if (data.type === 'NEW_READING') showToast('📟 Новое показание добавлено');
    if (data.type === 'NEW_BILL') showToast('💳 Сформирован новый счёт');
    if (data.type === 'BILL_PAID') showToast('✅ Счёт оплачен');
  }, []);

  const { connected } = useWebSocket(onWsMessage);

  const handleLogout = () => { logout(); navigate('/login'); };

  const ROLE_LABELS = { admin: 'Администратор', manager: 'Менеджер', resident: 'Жилец' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#1a1f2e', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100,
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #2d3447' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>⚡ ЖКХ Система</div>
          <div style={{ fontSize: 12, color: '#8892a4' }}>Учёт коммунальных ресурсов</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV.map(({ to, label, exact }) => (
            (to === '/users' && !['admin','manager'].includes(user?.role)) ? null :
            <NavLink key={to} to={to} end={exact} style={({ isActive }) => ({
              display: 'block', padding: '10px 12px', borderRadius: 8,
              marginBottom: 2, fontSize: 14, fontWeight: 500,
              color: isActive ? '#fff' : '#8892a4',
              background: isActive ? '#2d3447' : 'transparent',
              transition: 'all 0.15s',
            })}>
              {label}
            </NavLink>
          ))}
          {['admin','manager'].includes(user?.role) && (
            <NavLink to="/users" style={({ isActive }) => ({
              display: 'block', padding: '10px 12px', borderRadius: 8,
              marginBottom: 2, fontSize: 14, fontWeight: 500,
              color: isActive ? '#fff' : '#8892a4',
              background: isActive ? '#2d3447' : 'transparent',
              transition: 'all 0.15s',
            })}>
              👥 Пользователи
            </NavLink>
          )}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #2d3447' }}>
          <div className="ws-indicator" style={{ marginBottom: 12 }}>
            <div className={`ws-dot ${connected ? 'connected' : ''}`}></div>
            <span style={{ color: '#8892a4' }}>{connected ? 'Онлайн' : 'Переподключение...'}</span>
          </div>
          <div style={{ fontSize: 13, marginBottom: 4, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 12 }}>
            {ROLE_LABELS[user?.role]} • {user?.email}
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            🚪 Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, padding: 24, minHeight: '100vh' }}>
        <Outlet />
      </main>

      {toast && <div className="notification-toast">{toast}</div>}
    </div>
  );
}
