import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [workouts, setWorkouts] = useState([])
  const [bodyWeight, setBodyWeight] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      setWorkouts(workoutsData || [])

      const { data: weightData } = await supabase
        .from('body_weight')
        .select('*')
        .order('logged_at', { ascending: false })
        .limit(1)

      setBodyWeight(weightData?.[0] || null)
      setLoading(false)
    }

    loadData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const navigate = useNavigate()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Атлет'
  const colors = ['var(--accent)', 'var(--blue)', 'var(--purple)', 'var(--red)']

  // Обработчик нажатия на блок "Начать тренировку"
  const handleStartWorkout = () => {
    const activeWorkout = JSON.parse(localStorage.getItem('active_workout') || '{}')
    const exercises = activeWorkout.exercises || []
    
    if (exercises.length > 0) {
      // Если есть упражнения, идем в тренировку
      navigate('/workout')
    } else {
      // Если упражнений нет, идем в программы для выбора
      navigate('/programs')
    }
  }

  if (loading) return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0f', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)',
      paddingBottom: 'calc(83px + env(safe-area-inset-bottom, 34px) + 16px)'
    }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Загрузка...</div>
    </div>
  )

  return (
    <div 
      className="dashboard-container" 
      style={{ 
        display: 'flex', 
        minHeight: '100vh',
        paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)',
        paddingBottom: 'calc(83px + env(safe-area-inset-bottom, 34px) + 16px)'
      }}
    >

      {/* Sidebar */}
      <nav className="sidebar" style={{
        width: '72px', background: 'rgba(17,17,24,0.8)',
        backdropFilter: 'blur(20px)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 0', position: 'fixed', left: 0, top: 0, bottom: 0,
        gap: '8px', zIndex: 100
      }}>
        <div style={{
          width: '36px', height: '36px', background: 'var(--accent)',
          borderRadius: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '32px',
          boxShadow: '0 0 20px var(--accent-glow)',
          fontWeight: '800', fontSize: '16px', color: '#0a0a0f'
        }}>F</div>

        {[
          { icon: '⊞', label: 'Главная', active: true },
          { icon: '🏋', label: 'Тренировка' },
          { icon: '📈', label: 'Прогресс' },
          { icon: '📚', label: 'Упражнения' },
          { icon: '👤', label: 'Профиль' },
        ].map((item) => (
          <div key={item.label} title={item.label} style={{
            width: '44px', height: '44px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '18px',
            background: item.active ? 'var(--accent-dim)' : 'transparent',
            border: item.active ? '1px solid rgba(200,245,90,0.2)' : '1px solid transparent',
          }}>{item.icon}</div>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div onClick={handleLogout} title="Выйти" style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            color: 'white'
          }}>
            {firstName[0]}
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="main-content" style={{ marginLeft: '72px', flex: 1, padding: '40px 48px', maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          <div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '38px', lineHeight: 1.1 }}>
              Привет, <em style={{ color: 'var(--accent)' }}>{firstName}</em>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 300 }}>
              {workouts.length > 0 ? `${workouts.length} тренировок записано` : 'Начни свою первую тренировку'}
            </div>
          </div>
          <div style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '8px 16px',
            fontSize: '13px', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}/>
            {new Date().toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px', padding: '0 4px' }}>
          {[
            { label: 'Тренировок', value: workouts.length || '0', sub: 'всего записано', color: 'var(--accent)' },
            { label: 'Вес', value: bodyWeight ? `${bodyWeight.weight_kg}` : '—', sub: bodyWeight ? 'кг · последний замер' : 'не записан', color: 'var(--blue)' },
            { label: 'Серия', value: '0', sub: 'дней подряд', color: 'var(--purple)' },
          ].map((s) => (
            <div key={s.label} style={{
              background: `linear-gradient(135deg, ${s.color}10 0%, rgba(5,5,10,1) 100%)`,
              border: `1px solid ${s.color}30`,
              borderRadius: '18px',
              padding: '18px 16px',
              cursor: 'pointer',
              boxShadow: `0 12px 30px ${s.color}20`,
              transition: 'all 0.2s',
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
                background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none'
              }}/>
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{s.label}</div>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '34px', color: s.color, lineHeight: 1.05 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weight & Profile cards (Apple Fitness style) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px', marginTop: '12px', marginBottom: '28px' }}>
          {/* Weight card */}
          <div style={{
            background: '#1C1C1E',
            borderRadius: '20px',
            padding: '18px',
            aspectRatio: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
              ВЕС
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#c8f55a' }}>
                {bodyWeight ? bodyWeight.weight_kg : '—'}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>кг</div>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={async () => {
                  const kg = prompt('Введи вес (кг):', bodyWeight ? String(bodyWeight.weight_kg) : '')
                  if (!kg || kg === '') return
                  const { data: { user } } = await supabase.auth.getUser()
                  await supabase.from('body_weight').insert({ user_id: user.id, weight_kg: parseFloat(kg) })
                  const { data } = await supabase.from('body_weight').select('*').order('logged_at', { ascending: false }).limit(1)
                  setBodyWeight(data?.[0] || null)
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '13px'
                }}
              >
                ✏️
              </button>
            </div>
          </div>

          {/* Profile card */}
          <div
            onClick={() => navigate('/profile')}
            style={{
              background: '#1C1C1E',
              borderRadius: '20px',
              padding: '18px',
              aspectRatio: '1',
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
                Профиль
              </div>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '16px' }}>→</div>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  alt="Аватар"
                />
              ) : (
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 600
                }}>
                  {firstName[0]}
                </div>
              )}
              <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '8px' }}>
                {user?.user_metadata?.full_name || 'Атлет'}
              </div>
            </div>
          </div>
        </div>

        {/* Start workout */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Сегодня</div>

        <div style={{
          background: 'linear-gradient(135deg, #1a2a0a 0%, #0f1a05 100%)',
          border: '1px solid rgba(200,245,90,0.15)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '32px',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-elevated), rgba(200,245,90,0.08) 0 0 25px',
          transition: 'all 0.3s',
          overflow: 'hidden'
        }}
        onClick={handleStartWorkout}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-hover), rgba(200,245,90,0.12) 0 0 30px'
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,245,90,0.12) 0%, rgba(255,255,255,0.02) 100%)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-elevated), rgba(200,245,90,0.08) 0 0 25px'
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(200,245,90,0.08) 0%, rgba(255,255,255,0.01) 100%)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}>
          {/* Фон эффект */}
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(200,245,90,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}/>
          
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(200,245,90,0.15)', border: '1px solid rgba(200,245,90,0.3)',
                color: 'var(--accent)', fontSize: '11px', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '5px 10px', borderRadius: '6px', marginBottom: '16px'
              }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }}/>
                Готово к старту
              </div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Начать тренировку</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Выбери упражнения и записывай подходы в реальном времени</div>
            </div>
            <div style={{
              background: 'var(--accent)', color: '#0a0a0f',
              borderRadius: '50%',
              width: '52px', height: '52px', minWidth: '52px',
              fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-active)',
              transition: 'all 0.2s'
            }}>▶</div>
          </div>
        </div>

        {/* History */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          История тренировок
        </div>

        {workouts.length === 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(200,245,90,0.08) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(200,245,90,0.25)',
            borderRadius: '20px', padding: '40px', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: '14px',
            boxShadow: 'var(--shadow-card)'
          }}>
            Тренировок пока нет — начни первую! 💪
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'rgba(10,10,15,0.7)',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            {workouts.map((w, i) => (
              <div
                key={w.id}
                onClick={() => navigate(`/workout/${w.id}`)}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: 'transparent'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[i % 4], flexShrink: 0, marginRight: '12px' }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 500 }}>{w.name}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {new Date(w.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                    {w.duration_minutes ? ` · ${w.duration_minutes} мин` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
      </div>
  )
}