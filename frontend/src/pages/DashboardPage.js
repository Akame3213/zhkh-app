import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#1a56db', '#0e9f6e', '#d97706', '#e02424', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ apartments: 0, meters: 0, readings: 0, bills: [], pendingBills: 0, totalDebt: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/apartments'),
      api.get('/meters'),
      api.get('/readings'),
      api.get('/bills'),
    ]).then(([apts, meters, readings, bills]) => {
      const allBills = bills.data;
      const pending = allBills.filter(b => b.status !== 'paid');
      const debt = pending.reduce((s, b) => s + parseFloat(b.totalAmount), 0);
      setStats({
        apartments: apts.data.length,
        meters: meters.data.length,
        readings: readings.data.length,
        bills: allBills,
        pendingBills: pending.length,
        totalDebt: debt,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner"></div></div>;

  // Chart data: bills by period
  const byPeriod = {};
  stats.bills.forEach(b => {
    if (!byPeriod[b.period]) byPeriod[b.period] = 0;
    byPeriod[b.period] += parseFloat(b.totalAmount);
  });
  const chartData = Object.entries(byPeriod).sort().slice(-6).map(([period, total]) => ({
    period: period.slice(5) + '/' + period.slice(2, 4),
    total: parseFloat(total.toFixed(2)),
  }));

  // Pie: bill status
  const statusData = [
    { name: 'Оплачено', value: stats.bills.filter(b => b.status === 'paid').length },
    { name: 'Ожидает', value: stats.bills.filter(b => b.status === 'pending').length },
    { name: 'Просрочено', value: stats.bills.filter(b => b.status === 'overdue').length },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Квартиры', value: stats.apartments, icon: '🏠', color: '#1a56db' },
    { label: 'Счётчики', value: stats.meters, icon: '📟', color: '#0e9f6e' },
    { label: 'Показания', value: stats.readings, icon: '📝', color: '#d97706' },
    { label: 'Счета к оплате', value: stats.pendingBills, icon: '💳', color: '#e02424' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Главная панель</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Добро пожаловать, {user?.name}
          </div>
        </div>
        {stats.totalDebt > 0 && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            💳 Задолженность: {stats.totalDebt.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(card => (
          <div key={card.label} className="card stat-card">
            <div style={{ fontSize: 28 }}>{card.icon}</div>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Начислено по периодам (руб.)</div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => v.toLocaleString('ru-RU') + ' ₽'} />
                <Bar dataKey="total" fill="#1a56db" radius={[4, 4, 0, 0]} name="Сумма" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>Нет данных</div>}
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Статус счетов</div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>Нет данных</div>}
        </div>
      </div>
    </div>
  );
}
