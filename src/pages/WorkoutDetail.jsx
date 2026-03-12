import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

export default function WorkoutDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(null)
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: workout } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single()

      const { data: sets } = await supabase
        .from('workout_sets')
        .select('*, exercises(name, muscle_group)')
        .eq('workout_id', id)
        .order('set_number')

      setWorkout(workout)
      setSets(sets || [])
      setLoading(false)
    }
    load()
  }, [id])

  const updateSet = async (setId, field, value) => {
    setSets(prev => prev.map(s => s.id === setId ? { ...s, [field]: value } : s))
    await supabase.from('workout_sets').update({ [field]: parseFloat(value) }).eq('id', setId)
  }

  const deleteSet = async (setId) => {
    setSets(prev => prev.filter(s => s.id !== setId))
    await supabase.from('workout_sets').delete().eq('id', setId)
  }

  const deleteWorkout = async () => {
    if (!confirm('Удалить тренировку?')) return
    setDeleting(true)
    await supabase.from('workout_sets').delete().eq('workout_id', id)
    await supabase.from('workouts').delete().eq('id', id)
    navigate('/')
  }

  const updateWorkoutName = async (name) => {
    setWorkout(prev => ({ ...prev, name }))
    await supabase.from('workouts').update({ name }).eq('id', id)
  }

  // Группируем подходы по упражнению
  const grouped = sets.reduce((acc, set) => {
    const name = set.exercises?.name || 'Упражнение'
    if (!acc[name]) acc[name] = []
    acc[name].push(set)
    return acc
  }, {})

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>Загрузка...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px 100px' }}>

      {/* Хедер */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px 14px', color: 'var(--text-dim)',
          cursor: 'pointer', fontSize: '14px'
        }}>← Назад</button>
        <button onClick={deleteWorkout} disabled={deleting} style={{
          background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.2)',
          borderRadius: '10px', padding: '8px 14px', color: 'var(--red)',
          cursor: 'pointer', fontSize: '14px'
        }}>🗑 Удалить</button>
      </div>

      {/* Название тренировки */}
      <input
        value={workout?.name || ''}
        onChange={e => updateWorkoutName(e.target.value)}
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          fontFamily: 'DM Serif Display, serif', fontSize: '28px',
          color: 'var(--text)', width: '100%', marginBottom: '4px'
        }}
      />
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        {new Date(workout?.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        {workout?.duration_minutes ? ` · ${workout.duration_minutes} мин` : ''}
      </div>

      {/* Упражнения */}
      {Object.entries(grouped).map(([exName, exSets]) => (
        <div key={exName} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '20px', marginBottom: '16px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{exName}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {exSets[0]?.exercises?.muscle_group}
          </div>

          {/* Заголовки */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>№</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>КГ</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>ПОВТ</div>
            <div/>
          </div>

          {/* Подходы */}
          {exSets.map((set, i) => (
            <div key={set.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>{i + 1}</div>
              <input
                type="number"
                value={set.weight_kg || ''}
                onChange={e => updateSet(set.id, 'weight_kg', e.target.value)}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '10px', color: 'var(--text)',
                  fontSize: '15px', textAlign: 'center', outline: 'none',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />
              <input
                type="number"
                value={set.reps || ''}
                onChange={e => updateSet(set.id, 'reps', e.target.value)}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '10px', color: 'var(--text)',
                  fontSize: '15px', textAlign: 'center', outline: 'none',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />
              <button onClick={() => deleteSet(set.id)} style={{
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px'
              }}>✕</button>
            </div>
          ))}
        </div>
      ))}

      {sets.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '40px 0' }}>
          Подходы не записаны
        </div>
      )}

      <BottomNav />
    </div>
  )
}