import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

export default function Achievements() {
  const navigate = useNavigate()
  const [earned, setEarned] = useState([])
  const [workoutsCount, setWorkoutsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)

      const { data: workouts } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)

      setEarned(achievements || [])
      setWorkoutsCount(workouts?.length || 0)
      setLoading(false)
    }
    load()
  }, [])

  // Все возможные достижения
  const allAchievements = [
    { type: 'first_workout', title: 'Первый шаг', desc: 'Запиши первую тренировку', icon: '🎯', color: 'var(--accent)', condition: workoutsCount >= 1 },
    { type: 'workouts_5', title: 'Набираю обороты', desc: '5 тренировок записано', icon: '🔥', color: '#ff9f5a', condition: workoutsCount >= 5 },
    { type: 'workouts_10', title: 'Десятка', desc: '10 тренировок записано', icon: '💎', color: 'var(--blue)', condition: workoutsCount >= 10 },
    { type: 'workouts_25', title: 'Серьёзный подход', desc: '25 тренировок записано', icon: '⚡', color: 'var(--purple)', condition: workoutsCount >= 25 },
    { type: 'workouts_50', title: 'Полтинник', desc: '50 тренировок записано', icon: '🏆', color: '#ffd95a', condition: workoutsCount >= 50 },
    { type: 'workouts_100', title: 'Легенда', desc: '100 тренировок записано', icon: '👑', color: 'var(--accent)', condition: workoutsCount >= 100 },
  ]

  const isEarned = (type) => earned.find(a => a.type === type)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>Загрузка...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px 100px' }}>

      {/* Хедер */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px 14px', color: 'var(--text-dim)',
          cursor: 'pointer', fontSize: '14px'
        }}>← Назад</button>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px' }}>Достижения</div>
      </div>

      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        {earned.length} из {allAchievements.length} получено
      </div>

      {/* Прогресс бар */}
      <div style={{ background: 'var(--surface2)', borderRadius: '10px', height: '6px', marginBottom: '32px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '10px', background: 'var(--accent)',
          width: `${(earned.length / allAchievements.length) * 100}%`,
          transition: 'width 0.5s ease'
        }}/>
      </div>

      {/* Достижения */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {allAchievements.map(a => {
          const unlocked = isEarned(a.type)
          return (
            <div key={a.type} style={{
              background: unlocked ? 'var(--surface)' : 'var(--surface)',
              border: `1px solid ${unlocked ? a.color + '40' : 'var(--border)'}`,
              borderRadius: '20px', padding: '20px',
              display: 'flex', alignItems: 'center', gap: '16px',
              opacity: unlocked ? 1 : 0.5,
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: unlocked ? `${a.color}20` : 'var(--surface2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', flexShrink: 0,
                border: `1px solid ${unlocked ? a.color + '30' : 'var(--border)'}`,
                filter: unlocked ? 'none' : 'grayscale(1)'
              }}>{a.icon}</div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '3px', color: unlocked ? 'var(--text)' : 'var(--text-muted)' }}>
                  {a.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{a.desc}</div>
                {unlocked && (
                  <div style={{ fontSize: '11px', color: a.color, marginTop: '4px', fontWeight: 500 }}>
                    Получено {new Date(unlocked.earned_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </div>
                )}
              </div>

              {unlocked ? (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `${a.color}20`, border: `1px solid ${a.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: a.color, fontSize: '14px', flexShrink: 0
                }}>✓</div>
              ) : (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0
                }}>🔒</div>
              )}
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}