import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

export default function Workout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [exercises, setExercises] = useState([])
  const [selectedExercises, setSelectedExercises] = useState([])
  const [step, setStep] = useState('select')
  const [workoutName, setWorkoutName] = useState('Тренировка')
  const [elapsed, setElapsed] = useState(0)
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeExerciseId, setActiveExerciseId] = useState(null)
  const startTimeRef = useRef(null)

  // Загрузка данных
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUser(session.user)

      const { data } = await supabase.from('exercises').select('*').order('muscle_group')
      const allExercises = data || []
      setExercises(allExercises)

      // Восстанавливаем активную тренировку из localStorage
      const savedWorkout = localStorage.getItem('active_workout')
      if (savedWorkout) {
        const parsed = JSON.parse(savedWorkout)
        setSelectedExercises(parsed.exercises)
        setWorkoutName(parsed.name)
        startTimeRef.current = parsed.startTime
        setStep('active')
        return
      }

      // Берём упражнения из URL (пришли из библиотеки)
      const exerciseIds = searchParams.get('exercises')
      if (exerciseIds) {
        const idList = exerciseIds.split(',')
        const preselected = allExercises
          .filter(e => idList.includes(String(e.id)))
          .map(e => ({ ...e, sets: [] }))
        setSelectedExercises(preselected)
        const startTime = Date.now()
        startTimeRef.current = startTime
        localStorage.setItem('active_workout', JSON.stringify({
          exercises: preselected,
          name: 'Тренировка',
          startTime
        }))
        setStep('active')
      }
    }
    load()
  }, [searchParams])

  // Таймер через timestamp — точный после блокировки
  useEffect(() => {
    if (step !== 'active') return
    const tick = () => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [step])

  // Сохраняем в localStorage при каждом изменении
  const saveToLocal = (exs, name) => {
    if (!startTimeRef.current) return
    localStorage.setItem('active_workout', JSON.stringify({
      exercises: exs,
      name: name || workoutName,
      startTime: startTimeRef.current
    }))
  }

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const addSet = (exId) => {
    const updated = selectedExercises.map(e =>
      e.id === exId ? { ...e, sets: [...e.sets, { reps: '', weight: '', done: false }] } : e
    )
    setSelectedExercises(updated)
    saveToLocal(updated)
  }

  const updateSet = (exId, setIdx, field, value) => {
    const updated = selectedExercises.map(e =>
      e.id === exId ? {
        ...e,
        sets: e.sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s)
      } : e
    )
    setSelectedExercises(updated)
    saveToLocal(updated)
  }

  const toggleSetDone = (exId, setIdx) => {
    const updated = selectedExercises.map(e =>
      e.id === exId ? {
        ...e,
        sets: e.sets.map((s, i) => i === setIdx ? { ...s, done: !s.done } : s)
      } : e
    )
    setSelectedExercises(updated)
    saveToLocal(updated)
  }

  const removeSet = (exId, setIdx) => {
    const updated = selectedExercises.map(e =>
      e.id === exId ? { ...e, sets: e.sets.filter((_, i) => i !== setIdx) } : e
    )
    setSelectedExercises(updated)
    saveToLocal(updated)
  }

  const saveWorkout = async () => {
    setSaving(true)
    const duration = Math.floor(elapsed / 60)
    const { data: workout } = await supabase.from('workouts').insert({
      user_id: user.id,
      name: workoutName,
      duration_minutes: duration
    }).select().single()

    for (const ex of selectedExercises) {
      for (let i = 0; i < ex.sets.length; i++) {
        const s = ex.sets[i]
        if (!s.reps) continue
        await supabase.from('workout_sets').insert({
          workout_id: workout.id,
          exercise_id: ex.id,
          set_number: i + 1,
          reps: parseInt(s.reps),
          weight_kg: parseFloat(s.weight) || 0
        })
      }
    }

    localStorage.removeItem('active_workout')
    setSaving(false)
    setStep('done')
  }

  const cancelWorkout = () => {
    if (!confirm('Отменить тренировку? Данные будут удалены.')) return
    localStorage.removeItem('active_workout')
    navigate('/')
  }

  // Статистика
  const totalSets = selectedExercises.reduce((a, e) => a + e.sets.length, 0)
  const doneSets = selectedExercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0)

  // Экран выбора
  if (step === 'select') {
  const plan = JSON.parse(localStorage.getItem('workout_plan') || '[]')

  const removeFromPlan = (id) => {
    const updated = plan.filter(e => e.id !== id)
    localStorage.setItem('workout_plan', JSON.stringify(updated))
    // force re-render
    setSelectedExercises([...updated])
  }

  const startFromPlan = () => {
    if (plan.length === 0) return
    const withSets = plan.map(e => ({ ...e, sets: [] }))
    const startTime = Date.now()
    startTimeRef.current = startTime
    localStorage.setItem('active_workout', JSON.stringify({
      exercises: withSets,
      name: workoutName,
      startTime
    }))
    localStorage.removeItem('workout_plan')
    setSelectedExercises(withSets)
    setStep('active')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: '100px' }}>
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', marginBottom: '8px' }}>
          План тренировки
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
          {plan.length > 0 ? `${plan.length} упражнений выбрано` : 'Добавь упражнения из библиотеки'}
        </div>

        {plan.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
              Список пуст — добавь упражнения из библиотеки
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {plan.map((ex, i) => (
              <div key={ex.id} style={{
                background: 'linear-gradient(135deg, rgba(200,245,90,0.08) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(200,245,90,0.25)',
                borderRadius: '16px', 
                padding: '14px 16px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(200,245,90,0.15)',
                  border: '1px solid rgba(200,245,90,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', color: '#c8f55a', fontWeight: 600
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{ex.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{ex.muscle_group}</div>
                </div>
                <button onClick={() => removeFromPlan(ex.id)} style={{
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
                >✕</button>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => navigate('/exercises')} style={{
          width: '100%', background: 'transparent',
          border: '1px dashed rgba(200,245,90,0.3)',
          borderRadius: '14px', 
          padding: '14px',
          color: 'rgba(200,245,90,0.6)', 
          cursor: 'pointer',
          fontSize: '14px', 
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(200,245,90,0.5)'
          e.currentTarget.style.color = 'rgba(200,245,90,0.8)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(200,245,90,0.3)'
          e.currentTarget.style.color = 'rgba(200,245,90,0.6)'
        }}
        >+ Добавить упражнения из библиотеки</button>
      </div>

      {plan.length > 0 && (
        <div style={{ position: 'fixed', bottom: '80px', left: '16px', right: '16px', zIndex: 200 }}>
          <button onClick={startFromPlan} style={{
            width: '100%', background: '#c8f55a', color: '#000',
            border: 'none', borderRadius: '16px', padding: '16px',
            fontSize: '16px', fontWeight: 700, cursor: 'pointer',
            boxShadow: 'var(--shadow-xl)',
            fontFamily: 'Inter, sans-serif'
          }}>
            Начать тренировку · {plan.length} упр.
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

  // Экран завершения
  if (step === 'done') return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px' }}>
      <div style={{ fontSize: '64px' }}>🎉</div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px' }}>Готово!</div>
      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>{workoutName} · {formatTime(elapsed)} · {totalSets} подходов</div>
      <button onClick={() => navigate('/')} style={{
        background: '#c8f55a', color: '#000', border: 'none',
        borderRadius: '16px', padding: '16px 32px',
        fontSize: '16px', fontWeight: 700, cursor: 'pointer'
      }}>На главную</button>
    </div>
  )

  // Активная тренировка
  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: '100px' }}>

      {/* Хедер с таймером */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <input
            value={workoutName}
            onChange={e => { setWorkoutName(e.target.value); saveToLocal(selectedExercises, e.target.value) }}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'Playfair Display, serif', fontSize: '20px',
              color: '#fff', width: '180px'
            }}
          />
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '32px', fontWeight: 700, color: '#c8f55a', letterSpacing: '-1px' }}>
            {formatTime(elapsed)}
          </div>
        </div>

        {/* Прогресс бар */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: '#c8f55a', borderRadius: '2px',
              width: totalSets > 0 ? `${(doneSets / totalSets) * 100}%` : '0%',
              transition: 'width 0.3s ease'
            }}/>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
            {doneSets}/{totalSets} подходов
          </div>
        </div>
      </div>

      {/* Упражнения */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {selectedExercises.map((ex, exIdx) => {
          const isActive = activeExerciseId === ex.id
          const exDone = ex.sets.length > 0 && ex.sets.every(s => s.done)
          return (
            <div key={ex.id} style={{
              background: exDone 
                ? 'linear-gradient(135deg, rgba(200,245,90,0.08) 0%, rgba(255,255,255,0.01) 100%)' 
                : 'linear-gradient(135deg, rgba(92,158,255,0.06) 0%, rgba(255,255,255,0.005) 100%)',
              border: `1px solid ${exDone ? 'rgba(200,245,90,0.25)' : isActive ? 'rgba(92,158,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '20px', 
              overflow: 'hidden',
              boxShadow: isActive || exDone ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}>
              {/* Заголовок упражнения */}
              <div
                onClick={() => setActiveExerciseId(isActive ? null : ex.id)}
                style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: exDone ? 'rgba(200,245,90,0.15)' : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {exDone ? '✓' : String(exIdx + 1)}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: exDone ? '#c8f55a' : '#fff' }}>{ex.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {ex.muscle_group} · {ex.sets.length} подх.
                    </div>
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>{isActive ? '▲' : '▼'}</div>
              </div>

              {/* Подходы (раскрываются) */}
              {isActive && (
                <div style={{ padding: '0 16px 16px' }}>
                  {/* Заголовки */}
                  <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px 32px', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>№</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>КГ</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>ПОВТ</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>✓</div>
                    <div/>
                  </div>

                  {ex.sets.map((set, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{i + 1}</div>
                      <input
                        type="number" placeholder="0" value={set.weight}
                        onChange={e => updateSet(ex.id, i, 'weight', e.target.value)}
                        style={{
                          background: set.done ? 'rgba(200,245,90,0.08)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${set.done ? 'rgba(200,245,90,0.2)' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '10px', padding: '10px', color: '#fff',
                          fontSize: '15px', textAlign: 'center', outline: 'none',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      />
                      <input
                        type="number" placeholder="0" value={set.reps}
                        onChange={e => updateSet(ex.id, i, 'reps', e.target.value)}
                        style={{
                          background: set.done ? 'rgba(200,245,90,0.08)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${set.done ? 'rgba(200,245,90,0.2)' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '10px', padding: '10px', color: '#fff',
                          fontSize: '15px', textAlign: 'center', outline: 'none',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      />
                      <button
                        onClick={() => toggleSetDone(ex.id, i)}
                        style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          background: set.done ? '#c8f55a' : 'rgba(255,255,255,0.06)',
                          border: 'none', cursor: 'pointer', fontSize: '16px',
                          color: set.done ? '#000' : 'rgba(255,255,255,0.3)'
                        }}>✓</button>
                      <button onClick={() => removeSet(ex.id, i)} style={{
                        background: 'transparent', border: 'none',
                        color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '16px'
                      }}>✕</button>
                    </div>
                  ))}

                  <button onClick={() => addSet(ex.id)} style={{
                    width: '100%', background: 'transparent',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px',
                    color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                    fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px'
                  }}>+ Добавить подход</button>
                </div>
              )}
            </div>
          )
        })}

        {/* Добавить упражнение в активную тренировку */}
        <button onClick={() => {
          saveToLocal(selectedExercises)
          localStorage.setItem('workout_add_mode', '1')
          navigate('/exercises')
        }} style={{
          width: '100%', background: 'transparent',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '14px',
          color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          fontSize: '14px', fontFamily: 'Inter, sans-serif'
        }}>+ Добавить упражнение</button>
      </div>

      {/* Кнопки внизу */}
      <div style={{ position: 'fixed', bottom: '80px', left: '16px', right: '16px', display: 'flex', gap: '10px', zIndex: 200 }}>
        <button onClick={cancelWorkout} style={{
          background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.2)',
          borderRadius: '16px', padding: '16px', color: '#ff5c5c',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap'
        }}>Отменить</button>
        <button onClick={saveWorkout} disabled={saving} style={{
          flex: 1, background: saving ? 'rgba(200,245,90,0.5)' : '#c8f55a',
          color: '#000', border: 'none', borderRadius: '16px', padding: '16px',
          fontSize: '16px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif'
        }}>
          {saving ? 'Сохраняем...' : `Завершить · ${formatTime(elapsed)}`}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}