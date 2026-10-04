import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cx, focusRing } from './ui/styles';
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

/**
 * Large screens: a fixed column on the left.
 * Small screens: a slide-in menu, opened from the navbar (`open`) and closed with `onClose`.
 */
function Sidebar({ open = false, onClose, onLogout }) {
  const { role } = useAuth();
  const links = NAV_LINKS[role] ?? [];

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        aria-label="Sidebar"
        className={cx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white',
          'transition-[transform,visibility] duration-200 motion-reduce:transition-none',
          'lg:visible lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 lg:translate-x-0 lg:self-start',
          open ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h1 className="text-lg font-semibold text-slate-900">University Clearance</h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={cx(
              '-mr-2 flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden',
              focusRing,
            )}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                cx(
                  'block rounded-md px-4 py-2.5 text-sm font-medium',
                  focusRing,
                  isActive ? 'bg-sky-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onLogout}
            className={cx(
              'w-full rounded-md px-4 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50',
              focusRing,
            )}
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;