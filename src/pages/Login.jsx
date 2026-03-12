import { supabase } from '../supabase'

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    if (error) console.error('OAuth error:', error)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>FORMA</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px' }}>
          Твой личный фитнес-тренер
        </p>
        <button
          onClick={handleGoogleLogin}
          style={{
            background: 'rgb(200, 245, 90)',
            color: '#0a0a0f',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Войти в forma
        </button>
      </div>
    </div>
  )
}