import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data, error }) => {
        console.log('setSession result:', data, error)
        if (data.session) {
          navigate('/')
        } else {
          navigate('/login')
        }
      })
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate('/')
        } else {
          navigate('/login')
        }
      })
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Входим...</div>
    </div>
  )
}