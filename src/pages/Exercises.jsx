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

// Яркие градиенты и стили как на скриншоте 4 (верх карточки — сочный цвет, низ — тёмный)
const groupStyles = {
  'Грудь': { gradient: 'linear-gradient(180deg, #5B3A9E 0%, #472C83 50%, #1a1525 100%)', border: '#472C83', tagBg: '#3d2f5c', tagColor: '#fff' },
  'Спина': { gradient: 'linear-gradient(180deg, #1a6fd4 0%, #1354B5 50%, #0d2845 100%)', border: '#1354B5', tagBg: '#1e4978', tagColor: '#fff' },
  'Ноги': { gradient: 'linear-gradient(180deg, #7d9354 0%, #667651 50%, #0D1A0D 100%)', border: '#8a9c5e', tagBg: '#3d4622', tagColor: '#D2F756' },
  'Плечи': { gradient: 'linear-gradient(180deg, #c55206 0%, #9E4104 50%, #2a1808 100%)', border: '#9E4104', tagBg: '#5c3818', tagColor: '#fff' },
  'Трицепс': { gradient: 'linear-gradient(180deg, #c00d6e 0%, #A3095B 50%, #2d0a1f 100%)', border: '#A3095B', tagBg: '#5c2042', tagColor: '#fff' },
  'Бицепс': { gradient: 'linear-gradient(180deg, #04876a 0%, #036450 50%, #0d2a24 100%)', border: '#00C39A', tagBg: '#0d5c4a', tagColor: '#32FED4' },
  'Пресс': { gradient: 'linear-gradient(180deg, #b5a91a 0%, #9B9714 50%, #2d2b0f 100%)', border: '#9B9714', tagBg: '#4a4720', tagColor: '#fff' },
}
const defaultStyle = { gradient: 'linear-gradient(180deg, #04876a 0%, #036450 50%, #0d2a24 100%)', border: '#00C39A', tagBg: '#0d5c4a', tagColor: '#32FED4' }

// Для фильтров (иконки и подписи)
const groupColors = {
  'Грудь': '#a78bfa', 'Спина': '#5c9eff', 'Ноги': '#c8f55a', 'Плечи': '#ff9f5a',
  'Трицепс': '#ff5c5c', 'Бицепс': '#5affea', 'Пресс': '#ffd95a'
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
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)',
      paddingBottom: 'calc(83px + env(safe-area-inset-bottom, 34px) + 16px)'
    }}>
      <div style={{ color: 'rgba(255,255,255,0.3)' }}>Загрузка...</div>
    </div>
  )

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000',
      paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)',
      paddingBottom: 'calc(83px + env(safe-area-inset-bottom, 34px) + 16px)'
    }}>

      <div style={{ padding: '0 16px 0' }}>
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
        })}
      </div>

      <div style={{ padding: '0 16px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
        {filtered.length} упражнений{selected.length > 0 ? ` · ${selected.length} выбрано` : ''}
      </div>

      {/* Сетка — карточки 1:1 как на скриншоте 4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 16px 100px' }}>
        {filtered.map(ex => {
          const style = groupStyles[ex.muscle_group] || defaultStyle
          const isSelected = !!selected.find(e => e.id === ex.id)
          const icon = muscleIcon(ex.muscle_group)
          return (
            <div
              key={ex.id}
              onClick={() => toggleSelect(ex)}
              style={{
                background: '#090A05',
                border: `1px solid ${style.border}`,
                borderRadius: '15px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '200px',
                position: 'relative'
              }}
            >
              {/* Верх: яркий градиент на всю высоту блока + крупный эмодзи по центру */}
              <div style={{
                background: style.gradient,
                height: '110px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <span style={{ fontSize: '52px', lineHeight: 1, flexShrink: 0 }}>{icon}</span>
                {/* Круглая кнопка + (белый круг, тёмная обводка) — именно круг, не квадрат */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); toggleSelect(ex) }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelect(ex) } }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isSelected ? '#c8f55a' : '#fff',
                    border: '1.5px solid #1a1a1a',
                    color: isSelected ? '#000' : '#1a1a1a',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    boxSizing: 'border-box',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                    flexShrink: 0
                  }}
                >{isSelected ? '✓' : '+'}</div>
              </div>
              {/* Низ: название, подпись, тег группы в правом нижнем углу */}
              <div style={{
                padding: '12px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: '#090A05'
              }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>{ex.name}</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Свободный вес</span>
                <span style={{
                  marginTop: 'auto',
                  alignSelf: 'flex-end',
                  fontSize: '12px',
                  color: style.tagColor,
                  background: style.tagBg,
                  padding: '4px 8px',
                  borderRadius: '8px'
                }}>{ex.muscle_group}</span>
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
        <div style={{ 
          position: 'fixed', 
          bottom: 'calc(83px + env(safe-area-inset-bottom, 34px) + 12px)', 
          left: '16px', 
          right: '16px', 
          zIndex: 200 
        }}>
          <button onClick={addToPlan} style={{
            width: '100%', background: '#c8f55a', color: '#000',
            border: 'none', borderRadius: '16px', padding: '14px',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
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