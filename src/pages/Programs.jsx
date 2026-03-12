import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

// Цвета для групп мышц
const groupColors = {
  'грудь': '#c8f55a',
  'спина': '#5c9eff',
  'ноги': '#a855f7',
  'плечи': '#ff9f5a',
  'руки': '#5affea',
}

const programsData = {
  chest: {
    title: 'Грудь',
    emoji: '💪',
    programs: [
      {
        id: 'chest_1',
        name: 'Классическая тренировка груди',
        sets: [
          { name: 'Жим штанги лежа', reps: 8, weight: 100 },
          { name: 'Жим гантелей лежа', reps: 10, weight: 40 },
          { name: 'Разведения гантелей лежа', reps: 12, weight: 25 }
        ]
      },
      {
        id: 'chest_2',
        name: 'Легкая тренировка груди',
        sets: [
          { name: 'Жим штанги на наклонной скамье', reps: 10, weight: 80 },
          { name: 'Отжимания на брусьях', reps: 12, weight: 0 },
          { name: 'Кроссовер в тренажере', reps: 15, weight: 40 }
        ]
      }
    ]
  },
  back: {
    title: 'Спина',
    emoji: '🔙',
    programs: [
      {
        id: 'back_1',
        name: 'Мощная спина',
        sets: [
          { name: 'Становая тяга', reps: 5, weight: 140 },
          { name: 'Тяга штанги в наклоне', reps: 8, weight: 100 },
          { name: 'Подтягивания', reps: 10, weight: 0 }
        ]
      },
      {
        id: 'back_2',
        name: 'Объем спины',
        sets: [
          { name: 'Тяга в тренажере', reps: 10, weight: 80 },
          { name: 'Горизонтальная тяга', reps: 12, weight: 90 },
          { name: 'Тяга вертикального блока', reps: 12, weight: 70 }
        ]
      }
    ]
  },
  legs: {
    title: 'Ноги',
    emoji: '🦵',
    programs: [
      {
        id: 'legs_1',
        name: 'Железные ноги',
        sets: [
          { name: 'Приседания со штангой', reps: 6, weight: 120 },
          { name: 'Жим ногами', reps: 10, weight: 250 },
          { name: 'Разгибания ног в тренажере', reps: 12, weight: 80 }
        ]
      },
      {
        id: 'legs_2',
        name: 'Легкий день ног',
        sets: [
          { name: 'Выпады с гантелями', reps: 12, weight: 30 },
          { name: 'Сгибания ног в тренажере', reps: 12, weight: 80 },
          { name: 'Жим ногами', reps: 15, weight: 200 }
        ]
      }
    ]
  },
  shoulders: {
    title: 'Плечи',
    emoji: '🎯',
    programs: [
      {
        id: 'shoulders_1',
        name: 'Массивные плечи',
        sets: [
          { name: 'Жим штанги сидя', reps: 8, weight: 70 },
          { name: 'Тяга штанги к подбородку', reps: 10, weight: 60 },
          { name: 'Разведения гантелей в стороны', reps: 12, weight: 20 }
        ]
      },
      {
        id: 'shoulders_2',
        name: 'Рельефные плечи',
        sets: [
          { name: 'Армейский жим', reps: 10, weight: 60 },
          { name: 'Махи гантелей в наклоне', reps: 12, weight: 18 },
          { name: 'Шраги со штангой', reps: 12, weight: 100 }
        ]
      }
    ]
  },
  arms: {
    title: 'Руки',
    emoji: '💪',
    programs: [
      {
        id: 'arms_1',
        name: 'Большие бицепсы и трицепсы',
        sets: [
          { name: 'Сгибания штанги на бицепс', reps: 8, weight: 50 },
          { name: 'Жим узким хватом', reps: 8, weight: 100 },
          { name: 'Сгибания гантелей на бицепс', reps: 10, weight: 20 }
        ]
      },
      {
        id: 'arms_2',
        name: 'Насос для рук',
        sets: [
          { name: 'Молотки с гантелями', reps: 12, weight: 18 },
          { name: 'Трицепс-машина', reps: 12, weight: 60 },
          { name: 'Скамья для предплечий', reps: 15, weight: 40 }
        ]
      }
    ]
  }
}

export default function Programs() {
  const navigate = useNavigate()
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [editingProgram, setEditingProgram] = useState(null)
  const [editedPrograms, setEditedPrograms] = useState({})

  // Загружаем сохраненные отредактированные программы
  useEffect(() => {
    const saved = localStorage.getItem('custom_programs')
    if (saved) {
      setEditedPrograms(JSON.parse(saved))
    }
  }, [])

  // Функция получить свежую версию упражнений программы (с сохраненными edits или defaults)
  const getProgramData = (programId) => {
    if (editedPrograms[programId]) {
      return editedPrograms[programId]
    }
    // Ищем в оригинальных данных
    for (const group of Object.values(programsData)) {
      const found = group.programs.find(p => p.id === programId)
      if (found) return found.sets
    }
    return []
  }

  // Сохраняем отредактированную программу
  const saveProgram = (programId, sets) => {
    const updated = { ...editedPrograms, [programId]: sets }
    setEditedPrograms(updated)
    localStorage.setItem('custom_programs', JSON.stringify(updated))
    setEditingProgram(null)
  }

  // Обновляем поле в редактируемой программе
  const updateEditedSet = (index, field, value) => {
    const current = editingProgram.sets || []
    const updated = [...current]
    updated[index] = { ...updated[index], [field]: value }
    setEditingProgram({ ...editingProgram, sets: updated })
  }

  // Запускаем тренировку с упражнениями
  const startProgram = (program) => {
    const sets = getProgramData(program.id)
    
    const programExercises = sets.map((set, idx) => ({
      id: `${program.id}_${idx}`,
      name: set.name,
      muscle_group: programsData[selectedGroup].title.toLowerCase(),
      sets: [{ reps: String(set.reps), weight: String(set.weight), done: false }]
    }))

    const startTime = Date.now()
    localStorage.setItem('active_workout', JSON.stringify({
      exercises: programExercises,
      name: program.name,
      startTime
    }))

    navigate('/workout')
  }

  const groups = Object.entries(programsData).map(([key, data]) => ({
    id: key,
    ...data
  }))

  const groupColor = selectedGroup ? groupColors[selectedGroup] || '#c8f55a' : '#c8f55a'

  // Экран редактирования программы
  if (editingProgram) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#000',
        paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)',
        paddingBottom: 'calc(83px + env(safe-area-inset-bottom, 34px) + 16px)'
      }}>
        <div style={{ padding: '0 16px 0' }}>
          <button
            onClick={() => setEditingProgram(null)}
            style={{
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer', fontSize: '14px', marginBottom: '16px',
              padding: 0, fontFamily: 'Inter, sans-serif'
            }}
          >
            ← Назад
          </button>

          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', marginBottom: '24px' }}>
            Редактировать: {editingProgram.name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {editingProgram.sets && editingProgram.sets.map((set, idx) => (
              <div
                key={idx}
                style={{
                  background: `linear-gradient(135deg, ${groupColor}10 0%, rgba(255,255,255,0.02) 100%)`,
                  border: `1px solid ${groupColor}30`,
                  borderRadius: '20px',
                  padding: '18px',
                  boxShadow: `var(--shadow-elevated), ${groupColor}08 0 0 25px`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Фон эффект */}
                <div style={{
                  position: 'absolute',
                  top: 0, right: 0,
                  width: '100px', height: '100px',
                  background: `radial-gradient(circle, ${groupColor}15 0%, transparent 70%)`,
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }}/>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', color: '#fff' }}>
                    {idx + 1}. {set.name}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 500 }}>
                        ПОВТОРЕНИЯ
                      </label>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={e => updateEditedSet(idx, 'reps', parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%', background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${groupColor}40`, borderRadius: '12px',
                          padding: '10px 12px', color: '#fff', fontSize: '14px',
                          outline: 'none', fontFamily: 'Inter, sans-serif',
                          boxShadow: 'var(--shadow-interactive)'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 500 }}>
                        ВЕС (КГ)
                      </label>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={e => updateEditedSet(idx, 'weight', parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%', background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${groupColor}40`, borderRadius: '12px',
                          padding: '10px 12px', color: '#fff', fontSize: '14px',
                          outline: 'none', fontFamily: 'Inter, sans-serif',
                          boxShadow: 'var(--shadow-interactive)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: 'fixed', bottom: '80px', left: '16px', right: '16px', display: 'flex', gap: '10px', zIndex: 200 }}>
            <button
              onClick={() => setEditingProgram(null)}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '14px',
                color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              Отмена
            </button>
            <button
              onClick={() => saveProgram(editingProgram.id, editingProgram.sets)}
              style={{
                flex: 1, background: groupColor, color: '#000',
                border: 'none', borderRadius: '16px', padding: '14px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: 'var(--shadow-active)'
              }}
            >
              Сохранить
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000',
      paddingTop: 'calc(env(safe-area-inset-top, 44px) + 16px)',
      paddingBottom: 'calc(83px + env(safe-area-inset-bottom, 34px) + 16px)'
    }}>
      <div style={{ padding: '0 16px 0' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', marginBottom: '8px' }}>
          Программы
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
          Готовые сеты упражнений по группам мышц
        </div>

        {!selectedGroup ? (
          // Экран выбора группы мышц
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px', padding: '18px',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  cursor: 'pointer', transition: 'all 0.3s',
                  color: '#fff',
                  boxShadow: 'var(--shadow-card)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.boxShadow = `var(--shadow-hover), 0 0 30px rgba(200,245,90,0.1)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)'
                }}
              >
                <div style={{ fontSize: '32px' }}>{group.emoji}</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{group.title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {group.programs.length} программ
                  </div>
                </div>
                <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.3)' }}>→</div>
              </button>
            ))}
          </div>
        ) : (
          // Экран выбора программы
          <div>
            <button
              onClick={() => setSelectedGroup(null)}
              style={{
                background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: '14px', marginBottom: '20px',
                padding: 0, fontFamily: 'Inter, sans-serif'
              }}
            >
              ← Назад к группам
            </button>

            <div style={{ marginBottom: '16px' }}>
              {programsData[selectedGroup].programs.map(program => {
                const sets = getProgramData(program.id)
                const hasCustom = !!editedPrograms[program.id]
                
                // Иконки для каждого упражнения
                const exerciseIcons = {
                  'Жим': '🏋️',
                  'Тяга': '💪',
                  'Приседания': '🦵',
                  'Разведения': '⚡',
                  'Отжимания': '💥',
                  'Подтягивания': '🔝',
                  'Махи': '🌊',
                  'Молотки': '🔨',
                  'Шраги': '🔼',
                  'Сгибания': '💪',
                  'Становая': '⚙️',
                  'Выпады': '🦵',
                  'Разгибания': '⚡',
                }

                const getIconForExercise = (name) => {
                  for (const [key, icon] of Object.entries(exerciseIcons)) {
                    if (name.includes(key)) return icon
                  }
                  return '💪'
                }

                return (
                  <div key={program.id} style={{ marginBottom: '32px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                        {program.name}
                      </div>
                      {hasCustom && (
                        <div style={{ fontSize: '11px', color: groupColor, fontWeight: 600 }}>✓ Кастомизирована</div>
                      )}
                    </div>

                    {/* Двухколонная сетка упражнений */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      {sets.map((set, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: `linear-gradient(135deg, ${groupColor}10 0%, rgba(255,255,255,0.02) 100%)`,
                            border: `1px solid ${groupColor}25`,
                            borderRadius: '20px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            boxShadow: `var(--shadow-card), ${groupColor}08 0 0 20px`,
                            transition: 'all 0.3s',
                            minHeight: '200px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = `var(--shadow-hover), ${groupColor}15 0 0 20px`
                            e.currentTarget.style.transform = 'translateY(-4px)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = `var(--shadow-card), ${groupColor}08 0 0 20px`
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          {/* Верхняя часть с бейджем и кнопкой */}
                          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                            <div style={{
                              background: `${groupColor}30`,
                              border: `1px solid ${groupColor}50`,
                              borderRadius: '8px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: groupColor
                            }}>
                              {programsData[selectedGroup].title}
                            </div>
                            <button
                              onClick={() => setEditingProgram({ ...program, sets })}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: '#fff',
                                fontSize: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                fontWeight: 700,
                                boxShadow: 'var(--shadow-md)'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = `${groupColor}40`
                                e.currentTarget.style.borderColor = groupColor
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                              }}
                            >
                              ✎
                            </button>
                          </div>

                          {/* Центральная часть с иконкой */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '64px',
                            position: 'relative'
                          }}>
                            {getIconForExercise(set.name)}
                          </div>

                          {/* Нижняя часть с информацией */}
                          <div style={{ padding: '14px', position: 'relative', zIndex: 2 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px', lineHeight: 1.2 }}>
                              {set.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                              {set.reps} повт{set.weight > 0 ? ` · ${set.weight}кг` : ''}
                            </div>
                          </div>

                          {/* Фон эффект */}
                          <div style={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: '140px',
                            height: '140px',
                            background: `radial-gradient(circle, ${groupColor}20 0%, transparent 70%)`,
                            borderRadius: '50%',
                            pointerEvents: 'none'
                          }}/>
                        </div>
                      ))}
                    </div>

                    {/* Кнопка начать тренировку */}
                    <button
                      onClick={() => startProgram(program)}
                      style={{
                        width: '100%',
                        background: groupColor,
                        color: '#000',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '14px',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        boxShadow: `var(--shadow-xl)`,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = `var(--shadow-active)`
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = `var(--shadow-xl)`
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      Начать тренировку · {sets.length} упр.
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
