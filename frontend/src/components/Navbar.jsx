import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import { focusRing } from './ui/styles';
import { cx } from './ui/styles';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

// A role gets the bell once its notifications page exists.
const NOTIFICATION_PAGES = {
  STUDENT: {
    viewAllTo: '/student/notifications',
    clearancePath: (id) => `/student/clearance/${id}`,
  },
};

export default function Navbar({ onMenuClick, onLogout }) {
  const { user, role } = useAuth();
  const { data: profile } = useApi(authService.profile);
  const bell = NOTIFICATION_PAGES[role];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Small screens: the menu button and the app name (the sidebar is hidden there). */}
      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className={cx(
            '-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100',
            focusRing,
          )}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <span className="truncate text-base font-semibold text-slate-900">University Clearance</span>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {bell && <NotificationBell viewAllTo={bell.viewAllTo} clearancePath={bell.clearancePath} />}
        <UserMenu
          name={profile?.full_name}
          universityId={user?.university_id}
          role={role}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}