import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import BottomNav from '../components/BottomNav'

const muscleFilters = [
  { id: null, label: 'Все', icon: '⊞' },
  { id: 'Грудь', label: 'Грудь', icon: '🫁' },
  { id: 'Спина', label: 'Спина', icon: '🔙' },
  { id: 'Ноги', label: 'Ноги', icon: '🦵' },
  { id: 'Плечи', label: 'Плечи', icon: '⚡' },
  { id: 'Бицепс', label: 'Бицепс', icon: '💪' },
  { id: 'Трицепс', label: 'Трицепс', icon: '🔱' },
  { id: 'Пресс', label: 'Пресс', icon: '🔥' },
]

const groupColors = {
  'Грудь': '#c8f55a',
  'Спина': '#5c9eff',
  'Ноги': '#a855f7',
  'Плечи': '#ff9f5a',
  'Трицепс': '#ff5c5c',
  'Бицепс': '#5affea',
  'Пресс': '#ffd95a',
}

const muscleIcon = (group) => {
  const icons = { 'Грудь': '🏋️', 'Спина': '💪', 'Ноги': '🦵', 'Плечи': '⚡', 'Пресс': '🔥', 'Бицепс': '💪', 'Трицепс': '🔱' }
  return icons[group] || '💪'
}

export default function Exercises() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState(null)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('exercises').select('*').order('muscle_group').order('name', { ascending: true }).then(({ data }) => {
      if (!data) {
        setExercises([])
        setLoading(false)
        return
      }
      
      // Дедупликация по комбинации muscle_group + name (удаляем дубликаты)
      const seen = new Set()
      const uniqueExercises = data.filter(ex => {
        const key = `${ex.muscle_group}|${ex.name}`.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      
      setExercises(uniqueExercises)
      
      // Предвыбираем уже добавленные упражнения
      const isAddMode = localStorage.getItem('workout_add_mode')
      if (isAddMode) {
        const savedWorkout = JSON.parse(localStorage.getItem('active_workout') || '{}')
        const existing = savedWorkout.exercises || []
        setSelected(existing)
      }
      setLoading(false)
    }).catch(error => {
      console.error('Ошибка загрузки упражнений:', error)
      setLoading(false)
    })
  }, [])

  const filtered = exercises.filter(e => {
    const matchGroup = !activeGroup || e.muscle_group === activeGroup
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  })

  const toggleSelect = (ex) => {
    setSelected(prev =>
      prev.find(e => e.id === ex.id)
        ? prev.filter(e => e.id !== ex.id)
        : [...prev, ex]
    )
  }

  const addToPlan = () => {
  const isAddMode = localStorage.getItem('workout_add_mode')
  
  if (isAddMode) {
    // Добавляем в активную тренировку
    const savedWorkout = JSON.parse(localStorage.getItem('active_workout'))
    const existing = savedWorkout.exercises || []
    const newOnes = selected
      .filter(e => !existing.find(ex => ex.id === e.id))
      .map(e => ({ ...e, sets: [] }))
    const updated = [...existing, ...newOnes]
    savedWorkout.exercises = updated
    localStorage.setItem('active_workout', JSON.stringify(savedWorkout))
    localStorage.removeItem('workout_add_mode')
    navigate('/workout')
  } else {
    // Обычный режим — добавляем в план
    const existing = JSON.parse(localStorage.getItem('workout_plan') || '[]')
    const newOnes = selected.filter(e => !existing.find(ex => ex.id === e.id))
    const updated = [...existing, ...newOnes]
    localStorage.setItem('workout_plan', JSON.stringify(updated))
    navigate('/workout')
  }
}

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)' }}>Загрузка...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingBottom: '100px' }}>

      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', marginBottom: '16px' }}>
          Библиотека
        </div>
        <input
          placeholder="Поиск упражнения..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: '#111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '12px 16px',
            color: '#fff', fontSize: '14px', outline: 'none',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
            marginBottom: '16px'
          }}
        />
      </div>

      {/* Фильтры */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 16px 16px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {muscleFilters.map(f => {
          const active = activeGroup === f.id
          return (
            <div key={f.label} onClick={() => setActiveGroup(f.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', cursor: 'pointer', flexShrink: 0
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: active ? `${f.id ? groupColors[f.id] : '#c8f55a'}20` : '#111',
                border: `1.5px solid ${active ? (f.id ? groupColors[f.id] : '#c8f55a') : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', transition: 'all 0.15s'
              }}>{f.icon}</div>
              <span style={{
                fontSize: '9px', fontWeight: active ? 600 : 400,
                color: active ? (f.id ? groupColors[f.id] : '#c8f55a') : 'rgba(255,255,255,0.4)',
                fontFamily: 'Inter, sans-serif'
              }}>{f.label}</span>
            </div>
          )
        }}
      </div>

      <div style={{ padding: '0 16px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
        {filtered.length} упражнений{selected.length > 0 ? ` · ${selected.length} выбрано` : ''}
      </div>

      {/* Сетка */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 16px' }}>
        {filtered.map(ex => {
          const color = groupColors[ex.muscle_group] || '#c8f55a'
          const isSelected = !!selected.find(e => e.id === ex.id)
          return (
            <div 
              key={ex.id} 
              onClick={() => toggleSelect(ex)} 
              style={{
                background: `linear-gradient(135deg, ${color}10 0%, rgba(255,255,255,0.02) 100%)`,
                border: `1px solid ${color}25`,
                borderRadius: '20px', 
                overflow: 'hidden',
                cursor: 'pointer', 
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: `var(--shadow-card), ${color}08 0 0 20px`,
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `var(--shadow-hover), ${color}15 0 0 20px`
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = `var(--shadow-card), ${color}08 0 0 20px`
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Плюсик в углу */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                width: '36px', 
                height: '36px', 
                borderRadius: '50%',
                background: isSelected ? color : 'rgba(255,255,255,0.1)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '18px', 
                color: isSelected ? '#000' : '#fff',
                fontWeight: 700, 
                transition: 'all 0.2s',
                border: isSelected ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
              onClick={() => toggleSelect(ex)}
              onMouseEnter={e => {
                e.currentTarget.style.background = color
                e.currentTarget.style.color = '#000'
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isSelected ? color : 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = isSelected ? '#000' : '#fff'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              >{isSelected ? '✓' : '+'}</div>

              <div style={{
                height: '80px',
                background: `linear-gradient(135deg, ${color}15 0%, #1a1a1a 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', position: 'relative'
              }}>
                {muscleIcon(ex.muscle_group)}
                {/* Фон эффект */}
                <div style={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: '140px',
                  height: '140px',
                  background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }}/>
              </div>
              
              <div style={{ padding: '12px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    background: `${color}30`, border: `1px solid ${color}50`,
                    borderRadius: '8px', padding: '4px 8px',
                    fontSize: '10px', fontWeight: 700, color
                  }}>{ex.muscle_group}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}>{ex.name}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Свободный вес
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', padding: '60px 0' }}>
          Упражнений не найдено
        </div>
      )}

      {/* Кнопка старт */}
      {selected.length > 0 && (
  <div style={{ position: 'fixed', bottom: '80px', left: '16px', right: '16px', zIndex: 200 }}>
    <button onClick={addToPlan} style={{
      width: '100%', background: '#c8f55a', color: '#000',
      border: 'none', borderRadius: '16px', padding: '16px',
      fontSize: '16px', fontWeight: 700, cursor: 'pointer',
      boxShadow: 'var(--shadow-xl)',
      fontFamily: 'Inter, sans-serif'
    }}>
      Добавить в план · {selected.length} упр.
    </button>
  </div>
)}

      <BottomNav />
    </div>
  )
}