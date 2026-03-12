import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AuthCallback from './pages/AuthCallback'
import Workout from './pages/Workout'
import Progress from './pages/Progress'
import WorkoutDetail from './pages/WorkoutDetail'
import Exercises from './pages/Exercises'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'
import Programs from './pages/Programs'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('getSession:', session)
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('onAuthStateChange:', event, session)
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }} />
  )

  return (
<Routes>
  <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  <Route path="/progress" element={session ? <Progress /> : <Navigate to="/login" />} />
  <Route path="/workout/:id" element={session ? <WorkoutDetail /> : <Navigate to="/login" />} />
  <Route path="/workout" element={session ? <Workout /> : <Navigate to="/login" />} />
  <Route path="/exercises" element={session ? <Exercises /> : <Navigate to="/login" />} />
  <Route path="/programs" element={session ? <Programs /> : <Navigate to="/login" />} />
  <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />
  <Route path="/achievements" element={session ? <Achievements /> : <Navigate to="/login" />} />
  <Route path="/*" element={session ? <Dashboard /> : <Navigate to="/login" />} />
</Routes>
  )
}