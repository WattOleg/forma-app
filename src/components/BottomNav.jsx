import { useNavigate, useLocation } from 'react-router-dom'

const icons = {
  home: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" strokeLinejoin="round"
        fill={active ? 'rgba(200,245,90,0.1)' : 'none'}/>
    </svg>
  ),
  workout: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 4V20M18 4V20M3 8H7M17 8H21M3 16H7M17 16H21M7 8H17M7 16H17"
        stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  progress: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 17L8 12L13 14L21 7" stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 20H21" stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  exercises: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="2.5" rx="1.25" fill={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'}/>
      <rect x="3" y="11" width="18" height="2.5" rx="1.25" fill={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'}/>
      <rect x="3" y="17" width="12" height="2.5" rx="1.25" fill={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'}/>
    </svg>
  ),
  programs: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'}/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'}/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'}/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'}/>
    </svg>
  ),
  profile: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5"/>
      <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20"
        stroke={active ? '#c8f55a' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const tabs = [
  { icon: 'home', label: 'Главная', path: '/' },
  { icon: 'workout', label: 'Тренировка', path: '/workout' },
  { icon: 'progress', label: 'Прогресс', path: '/progress' },
  { icon: 'exercises', label: 'Упражнения', path: '/exercises' },
  { icon: 'programs', label: 'Программы', path: '/programs' },
  { icon: 'profile', label: 'Профиль', path: '/profile' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '83px',
      background: 'rgba(28,28,30,0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      zIndex: 1000,
      paddingTop: '8px',
      paddingBottom: 'env(safe-area-inset-bottom, 34px)',
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path ||
          (tab.path !== '/' && location.pathname.startsWith(tab.path))
        return (
          <div key={tab.path} onClick={() => navigate(tab.path)} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            minHeight: '44px',
            justifyContent: 'flex-start',
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.15s',
          }}>
            {icons[tab.icon](active)}
            <span style={{
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '-0.1px',
              color: active ? '#c8f55a' : 'rgba(255,255,255,0.4)',
              fontFamily: 'Inter, sans-serif',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{tab.label}</span>
          </div>
        )
      })}
    </div>
  )
}