import { NavLink, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const isStudent = location.pathname.startsWith('/student');
  const isOfficer = location.pathname.startsWith('/officer');
  const isRegistrar = location.pathname.startsWith('/registrar');

  let links = [];

  if (isStudent) {
    links = [
      { label: 'Dashboard', path: '/student' },
      { label: 'Clearance', path: '/student/clearance' },
      { label: 'History', path: '/student/history' },
      { label: 'Notifications', path: '/student/notifications' },
      { label: 'Profile', path: '/student/profile' },
    ];
  }

  if (isOfficer) {
    links = [
      { label: 'Dashboard', path: '/officer' },
      { label: 'Clearances', path: '/officer/clearances' },
      { label: 'Issues', path: '/officer/issues' },
    ];
  }

  if (isRegistrar) {
    links = [
      { label: 'Dashboard', path: '/registrar' },
      { label: 'Students', path: '/registrar/students' },
      { label: 'Clearances', path: '/registrar/clearances' },
      { label: 'Issues', path: '/registrar/issues' },
      { label: 'Completed', path: '/registrar/completed' },
    ];
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">
          University Clearance
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;