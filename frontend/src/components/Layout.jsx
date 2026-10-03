import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            University Clearance System
          </h2>

          <div className="flex items-center gap-4">
            <button type="button" className="text-slate-600 hover:text-slate-900">
              🔔
            </button>

            <div className="text-sm font-medium text-slate-700">User</div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;