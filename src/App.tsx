import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'

// Dashboard is the landing page, so it loads eagerly for the fastest first paint.
// Everything else — especially Statistics (recharts) and TypeRush — is lazy,
// since most sessions only ever touch a couple of these routes.
const Practice = lazy(() => import('./pages/Practice'))
const Lessons = lazy(() => import('./pages/Lessons'))
const LessonDetail = lazy(() => import('./pages/LessonDetail'))
const Tests = lazy(() => import('./pages/Tests'))
const Games = lazy(() => import('./pages/Games'))
const TypeRush = lazy(() => import('./pages/TypeRush'))
const Statistics = lazy(() => import('./pages/Statistics'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:id" element={<LessonDetail />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/type-rush" element={<TypeRush />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
