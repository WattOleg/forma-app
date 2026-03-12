export default function MuscleMap({ activeGroup, onSelect }) {
  const groups = {
    'Грудь': '#c8f55a',
    'Спина': '#5c9eff',
    'Ноги': '#a855f7',
    'Плечи': '#ff9f5a',
    'Трицепс': '#ff5c5c',
    'Бицепс': '#5affea',
    'Пресс': '#ffd95a',
  }

  const active = (group) => activeGroup === group
  const color = (group) => active(group) ? groups[group] : 'rgba(255,255,255,0.15)'
  const glow = (group) => active(group) ? `drop-shadow(0 0 6px ${groups[group]})` : 'none'

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 24px' }}>
      <svg width="160" height="320" viewBox="0 0 160 320" fill="none">

        {/* Голова */}
        <ellipse cx="80" cy="22" rx="18" ry="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>

        {/* Шея */}
        <rect x="72" y="42" width="16" height="12" rx="4" fill="rgba(255,255,255,0.08)"/>

        {/* Торс основа */}
        <path d="M52 54 L108 54 L114 130 L46 130 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>

        {/* Грудь левая */}
        <path d="M58 58 L80 62 L78 90 L54 88 Z"
          fill={color('Грудь')} style={{ filter: glow('Грудь'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Грудь')}/>

        {/* Грудь правая */}
        <path d="M102 58 L80 62 L82 90 L106 88 Z"
          fill={color('Грудь')} style={{ filter: glow('Грудь'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Грудь')}/>

        {/* Пресс */}
        <path d="M66 92 L94 92 L96 128 L64 128 Z"
          fill={color('Пресс')} style={{ filter: glow('Пресс'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Пресс')}/>

        {/* Пресс линии */}
        {active('Пресс') && <>
          <line x1="80" y1="92" x2="80" y2="128" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
          <line x1="64" y1="104" x2="96" y2="104" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
          <line x1="64" y1="116" x2="96" y2="116" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
        </>}

        {/* Плечо левое */}
        <ellipse cx="44" cy="70" rx="14" ry="18"
          fill={color('Плечи')} style={{ filter: glow('Плечи'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Плечи')}/>

        {/* Плечо правое */}
        <ellipse cx="116" cy="70" rx="14" ry="18"
          fill={color('Плечи')} style={{ filter: glow('Плечи'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Плечи')}/>

        {/* Бицепс левый */}
        <path d="M30 86 L44 84 L46 114 L28 112 Z"
          fill={color('Бицепс')} style={{ filter: glow('Бицепс'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Бицепс')}/>

        {/* Бицепс правый */}
        <path d="M130 86 L116 84 L114 114 L132 112 Z"
          fill={color('Бицепс')} style={{ filter: glow('Бицепс'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Бицепс')}/>

        {/* Трицепс левый */}
        <path d="M22 88 L32 86 L30 116 L20 114 Z"
          fill={color('Трицепс')} style={{ filter: glow('Трицепс'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Трицепс')}/>

        {/* Трицепс правый */}
        <path d="M138 88 L128 86 L130 116 L140 114 Z"
          fill={color('Трицепс')} style={{ filter: glow('Трицепс'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Трицепс')}/>

        {/* Предплечья */}
        <path d="M20 116 L32 114 L34 140 L18 138 Z" fill="rgba(255,255,255,0.08)"/>
        <path d="M140 116 L128 114 L126 140 L142 138 Z" fill="rgba(255,255,255,0.08)"/>

        {/* Таз */}
        <path d="M54 128 L106 128 L110 150 L50 150 Z" fill="rgba(255,255,255,0.06)"/>

        {/* Бедро левое */}
        <path d="M50 148 L78 148 L76 218 L46 216 Z"
          fill={color('Ноги')} style={{ filter: glow('Ноги'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Ноги')}/>

        {/* Бедро правое */}
        <path d="M110 148 L82 148 L84 218 L114 216 Z"
          fill={color('Ноги')} style={{ filter: glow('Ноги'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Ноги')}/>

        {/* Голень левая */}
        <path d="M47 218 L75 218 L73 280 L44 278 Z"
          fill={color('Ноги')} style={{ filter: glow('Ноги'), cursor: 'pointer', opacity: 0.7, transition: 'all 0.2s' }}
          onClick={() => onSelect('Ноги')}/>

        {/* Голень правая */}
        <path d="M113 218 L85 218 L87 280 L116 278 Z"
          fill={color('Ноги')} style={{ filter: glow('Ноги'), cursor: 'pointer', opacity: 0.7, transition: 'all 0.2s' }}
          onClick={() => onSelect('Ноги')}/>

        {/* Ступни */}
        <ellipse cx="58" cy="288" rx="16" ry="8" fill="rgba(255,255,255,0.08)"/>
        <ellipse cx="102" cy="288" rx="16" ry="8" fill="rgba(255,255,255,0.08)"/>

        {/* Спина — невидимая зона поверх торса */}
        <rect x="130" y="54" width="24" height="24" rx="6"
          fill={color('Спина')} style={{ filter: glow('Спина'), cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onSelect('Спина')}/>
        <text x="142" y="70" textAnchor="middle" fontSize="9" fill={active('Спина') ? '#000' : 'rgba(255,255,255,0.5)'} style={{pointerEvents: 'none'}}>
          Спина
        </text>

      </svg>
    </div>
  )
}