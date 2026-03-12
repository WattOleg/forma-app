import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import BottomNav from '../components/BottomNav'

export default function Progress() {
  const navigate = useNavigate()
  const [weightData, setWeightData] = useState([])
  const [workoutData, setWorkoutData] = useState([])
  const [tab, setTab] = useState('weight')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: weights } = await supabase
        .from('body_weight')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: true })
        .limit(20)

      setWeightData((weights || []).map(w => ({
        date: new Date(w.logged_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        вес: w.weight_kg
      })))

      const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20)

      setWorkoutData((workouts || []).map(w => ({
        date: new Date(w.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        мин: w.duration_minutes || 0
      })))

      setLoading(false)
    }
    load()
  }, [])

  const tabs = [
    { id: 'weight', label: 'Вес' },
    { id: 'workouts', label: 'Тренировки' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Загрузка...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px 100px' }}>

      {/* Хедер */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '8px 14px', color: 'var(--text-dim)',
          cursor: 'pointer', fontSize: '14px',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        }}
        >← Назад</button>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px' }}>Прогресс</div>
      </div>

      {/* Табы */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? 'var(--accent-dim)' : 'var(--surface)',
            border: `1px solid ${tab === t.id ? 'rgba(200,245,90,0.3)' : 'var(--border)'}`,
            borderRadius: '12px', padding: '10px 20px',
            color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif'
          }}>{t.label}</button>
        ))}
      </div>

      {/* График веса */}
      {tab === 'weight' && (
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(200,245,90,0.08) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(200,245,90,0.25)', 
            borderRadius: '20px', 
            padding: '24px', 
            marginBottom: '16px',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Фон эффект */}
            <div style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(200,245,90,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}/>
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>Динамика веса</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>кг · последние замеры</div>

              {weightData.length < 2 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '40px 0' }}>
                  Добавь минимум 2 замера веса на главной чтобы увидеть график 📊
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weightData}>
                    <XAxis dataKey="date" tick={{ fill: 'rgba(240,240,245,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(240,240,245,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }}
                      labelStyle={{ color: 'var(--text-muted)', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="вес" stroke="#c8f55a" strokeWidth={2.5} dot={{ fill: '#c8f55a', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Статистика веса */}
          {weightData.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Текущий', value: `${weightData[weightData.length - 1]?.вес} кг`, color: '#c8f55a' },
                { label: 'Минимум', value: `${Math.min(...weightData.map(w => w.вес))} кг`, color: '#5c9eff' },
                { label: 'Максимум', value: `${Math.max(...weightData.map(w => w.вес))} кг`, color: '#a855f7' },
                { label: 'Замеров', value: weightData.length, color: '#5affea' },
              ].map(s => (
                <div key={s.label} style={{ 
                  background: `linear-gradient(135deg, ${s.color}10 0%, rgba(255,255,255,0.01) 100%)`,
                  border: `1px solid ${s.color}25`,
                  borderRadius: '16px', 
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Фон эффект */}
                  <div style={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: '80px',
                    height: '80px',
                    background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`,
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }}/>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{s.label}</div>
                    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: s.color }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* График тренировок */}
      {tab === 'workouts' && (
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(92,158,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(92,158,255,0.25)', 
            borderRadius: '20px', 
            padding: '24px', 
            marginBottom: '16px',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Фон эффект */}
            <div style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(92,158,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}/>
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>Длительность тренировок</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>минут · последние тренировки</div>

              {workoutData.length < 2 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '40px 0' }}>
                  Запиши минимум 2 тренировки чтобы увидеть график 💪
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={workoutData}>
                    <XAxis dataKey="date" tick={{ fill: 'rgba(240,240,245,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(240,240,245,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }}
                      labelStyle={{ color: 'var(--text-muted)', fontSize: '12px' }}
                    />
                    <Bar dataKey="мин" fill="#5c9eff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Статистика тренировок */}
          {workoutData.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Всего', value: workoutData.length, color: '#c8f55a' },
                { label: 'Среднее', value: `${Math.round(workoutData.reduce((a, w) => a + w.мин, 0) / workoutData.length)} мин`, color: '#5c9eff' },
                { label: 'Максимум', value: `${Math.max(...workoutData.map(w => w.мин))} мин`, color: '#a855f7' },
                { label: 'Суммарно', value: `${workoutData.reduce((a, w) => a + w.мин, 0)} мин`, color: '#5affea' },
              ].map(s => (
                <div key={s.label} style={{ 
                  background: `linear-gradient(135deg, ${s.color}10 0%, rgba(255,255,255,0.01) 100%)`,
                  border: `1px solid ${s.color}25`,
                  borderRadius: '16px', 
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Фон эффект */}
                  <div style={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: '80px',
                    height: '80px',
                    background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`,
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }}/>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{s.label}</div>
                    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', color: s.color }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}