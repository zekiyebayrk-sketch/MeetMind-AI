import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
import NewMeeting from '../pages/NewMeeting'
import AnalysisResult from '../pages/AnalysisResult'
import History from '../pages/History'
import Settings from '../pages/Settings'

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-meeting" element={<NewMeeting />} />
        <Route path="/analysis-result" element={<AnalysisResult />} />
        <Route path="/analysis-result/:meetingId" element={<AnalysisResult />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
