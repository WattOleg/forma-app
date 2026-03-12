import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const allAchievements = [
  { type: 'first_workout', title: 'Первый шаг', icon: '🎯', color: '#c8f55a', required: 1, description: 'Завершить 1 тренировку' },
  { type: 'workouts_5', title: 'Набираю обороты', icon: '🔥', color: '#ff9f5a', required: 5, description: 'Завершить 5 тренировок' },
  { type: 'workouts_10', title: 'Десятка', icon: '💎', color: '#5c9eff', required: 10, description: 'Завершить 10 тренировок' },
  { type: 'workouts_25', title: 'Серьёзный подход', icon: '⚡', color: '#a855f7', required: 25, description: 'Завершить 25 тренировок' },
  { type: 'workouts_50', title: 'Полтинник', icon: '🏆', color: '#ffd95a', required: 50, description: 'Завершить 50 тренировок' },
  { type: 'workouts_100', title: 'Легенда', icon: '👑', color: '#c8f55a', required: 100, description: 'Завершить 100 тренировок' },
]

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ workouts: 0, totalMin: 0 })
  const [weightHistory, setWeightHistory] = useState([])
  const [earned, setEarned] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoverAchievement, setHoverAchievement] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: workouts } = await supabase
        .from('workouts').select('duration_minutes').eq('user_id', user.id)

      const { data: weights } = await supabase
        .from('body_weight').select('*').eq('user_id', user.id)
        .order('logged_at', { ascending: false }).limit(5)

      const { data: achievements } = await supabase
        .from('achievements').select('*').eq('user_id', user.id)

      setStats({
        workouts: workouts?.length || 0,
        totalMin: workouts?.reduce((a, w) => a + (w.duration_minutes || 0), 0) || 0
      })
      setWeightHistory(weights || [])
      setEarned(achievements || [])
      setLoading(false)
    }
    load()
  }, [])

  const deleteWeight = async (id) => {
    await supabase.from('body_weight').delete().eq('id', id)
    setWeightHistory(prev => prev.filter(w => w.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Атлет'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)' }}>Загрузка...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '24px 16px 100px' }}>

      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', marginBottom: '24px' }}>Профиль</div>

      {/* Аватар */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(200,245,90,0.08) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(200,245,90,0.25)',
        borderRadius: '20px', 
        padding: '24px', 
        marginBottom: '16px',
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
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
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 600
            }}>{firstName[0]}</div>
          )}
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{user?.user_metadata?.full_name}</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
            С нами с {new Date(user?.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Тренировок', value: stats.workouts, color: '#c8f55a' },
          { label: 'Часов', value: Math.round(stats.totalMin / 60), color: '#5c9eff' },
          { label: 'Достижений', value: earned.length, color: '#a855f7' },
        ].map(s => (
          <div key={s.label} style={{
            background: `linear-gradient(135deg, ${s.color}10 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${s.color}25`,
            borderRadius: '16px', 
            padding: '16px', 
            textAlign: 'center',
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
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Достижения */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168,139,250,0.08) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(168,139,250,0.25)',
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
          background: 'radial-gradient(circle, rgba(168,139,250,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}/>
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>Достижения</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>{earned.length} из {allAchievements.length}</div>
          </div>

          {/* Прогресс бар */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '4px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: '#c8f55a', borderRadius: '4px',
              width: `${(earned.length / allAchievements.length) * 100}%`,
              transition: 'width 0.5s ease'
            }}/>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {allAchievements.map((a, idx) => {
              const unlocked = earned.find(e => e.type === a.type)
              const progressToNext = Math.min(stats.workouts, a.required)
              const progressPercent = (progressToNext / a.required) * 100
              const isHovered = hoverAchievement === a.type
              return (
                <div 
                  key={a.type} 
                  style={{ 
                    textAlign: 'center', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s', 
                    position: 'relative'
                  }}
                  onMouseEnter={() => setHoverAchievement(a.type)}
                  onMouseLeave={() => setHoverAchievement(null)}
                >
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto',
                      background: unlocked ? `linear-gradient(135deg, ${a.color}20 0%, rgba(255,255,255,0.01) 100%)` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${unlocked ? a.color + '40' : 'rgba(255,255,255,0.06)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '26px', filter: unlocked ? 'none' : 'grayscale(1)',
                      opacity: unlocked ? 1 : 0.35, transition: 'all 0.2s',
                      boxShadow: unlocked ? `0 4px 12px ${a.color}20` : 'none',
                      position: 'relative'
                    }}>
                      {a.icon}
                      {!unlocked && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${a.color}40 0%, ${a.color}20 100%)`,
                          border: `1px solid ${a.color}60`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: a.color,
                          fontWeight: 700
                        }}>
                          {Math.min(stats.workouts, a.required)}/{a.required}
                        </div>
                      )}
                    </div>
                    
                    {/* Прогресс бар для заблокированных */}
                    {!unlocked && (
                      <div style={{
                        width: '100%',
                        height: '2px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '1px',
                        marginTop: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          background: a.color,
                          width: `${progressPercent}%`,
                          transition: 'width 0.5s ease'
                        }}/>
                      </div>
                    )}
                  </div>
                  
                  {/* Название */}
                  <div style={{ fontSize: '10px', color: unlocked ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: unlocked ? 500 : 400, lineHeight: 1.3 }}>
                    {a.title}
                  </div>
                  
                  {/* Статус */}
                  {unlocked ? (
                    <div style={{ fontSize: '8px', color: a.color, marginTop: '2px', fontWeight: 500 }}>получено</div>
                  ) : (
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      {Math.max(0, a.required - stats.workouts)} осталось
                    </div>
                  )}
                  
                  {/* Описание при hover */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-90px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: `linear-gradient(135deg, ${a.color}30 0%, rgba(255,255,255,0.05) 100%)`,
                      border: `1px solid ${a.color}50`,
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '10px',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      zIndex: 100,
                      boxShadow: 'var(--shadow-elevated)'
                    }}>
                      {a.description}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* История веса */}
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
          <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>История веса</div>
          {weightHistory.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
              Нет записей
            </div>
          ) : (
            weightHistory.map(w => (
              <div key={w.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#c8f55a' }}>{w.weight_kg} кг</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(w.logged_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <button onClick={() => deleteWeight(w.id)} style={{
                  background: 'rgba(255,92,92,0.2)', 
                  border: '1px solid rgba(255,92,92,0.3)',
                  borderRadius: '8px', 
                  padding: '6px 10px', 
                  color: '#ff5c5c',
                  cursor: 'pointer', 
                  fontSize: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,92,92,0.3)'
                  e.currentTarget.style.borderColor = 'rgba(255,92,92,0.5)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,92,92,0.2)'
                  e.currentTarget.style.borderColor = 'rgba(255,92,92,0.3)'
                }}
                >Удалить</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Выйти */}
      <button onClick={handleLogout} style={{
        width: '100%', background: 'rgba(255,92,92,0.1)',
        border: '1px solid rgba(255,92,92,0.15)', borderRadius: '16px',
        padding: '16px', color: '#ff5c5c', fontSize: '15px',
        fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
      }}>Выйти из аккаунта</button>

      <BottomNav />
    </div>
  )
}