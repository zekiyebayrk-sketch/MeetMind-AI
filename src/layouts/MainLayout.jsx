import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 px-4 py-6 pb-24 sm:px-6 md:px-10 md:py-10 md:pb-10">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout
