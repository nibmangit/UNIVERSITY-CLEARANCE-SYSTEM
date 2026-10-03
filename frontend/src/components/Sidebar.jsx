import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_LINKS = {
  STUDENT: [
    { label: 'Dashboard', path: '/student', end: true },
    { label: 'Clearance', path: '/student/clearance' },
    { label: 'History', path: '/student/history' },
    { label: 'Notifications', path: '/student/notifications' },
    { label: 'Profile', path: '/student/profile' },
  ],
  OFFICER: [
    { label: 'Dashboard', path: '/officer', end: true },
    { label: 'Clearances', path: '/officer/clearances' },
    { label: 'Issues', path: '/officer/issues' },
  ],
  REGISTRAR: [
    { label: 'Dashboard', path: '/registrar', end: true },
    { label: 'Students', path: '/registrar/students' },
    { label: 'Clearances', path: '/registrar/clearances' },
    { label: 'Issues', path: '/registrar/issues' },
    { label: 'Completed', path: '/registrar/completed' },
  ],
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800';

function Sidebar() {
  const { role, logout } = useAuth();
  const links = NAV_LINKS[role] ?? [];

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <h1 className="text-lg font-semibold text-slate-900">University Clearance</h1>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-md px-4 py-2.5 text-sm font-medium ${focusRing} ${
                isActive ? 'bg-sky-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={logout}
          className={`w-full rounded-md px-4 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50 ${focusRing}`}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;