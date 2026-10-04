import Avatar from './ui/Avatar';
import Dropdown, { DropdownItem } from './ui/Dropdown';

const ROLE_LABELS = {
  STUDENT: 'Student',
  OFFICER: 'Officer',
  REGISTRAR: 'Registrar',
  ADMIN: 'Administrator',
};

// Only roles that have a profile page yet.
const PROFILE_PATHS = {
  STUDENT: '/student/profile',
};

export default function UserMenu({ name, universityId, role, onLogout }) {
  const displayName = name || universityId || 'Account';
  const profilePath = PROFILE_PATHS[role];

  return (
    <Dropdown
      label="Account menu"
      buttonClassName="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 sm:pr-3"
      trigger={
        <>
          <Avatar name={displayName} size="sm" />
          <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 sm:block">
            {displayName}
          </span>
          <svg
            className="hidden h-4 w-4 text-slate-500 sm:block"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </>
      }
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
        <p className="text-xs text-slate-500">
          {ROLE_LABELS[role] ?? role}
          {universityId ? ` · ${universityId}` : ''}
        </p>
      </div>

      <div className="py-1">
        {profilePath && <DropdownItem to={profilePath}>My profile</DropdownItem>}
        <DropdownItem tone="danger" onClick={onLogout}>
          Log out
        </DropdownItem>
      </div>
    </Dropdown>
  );
}