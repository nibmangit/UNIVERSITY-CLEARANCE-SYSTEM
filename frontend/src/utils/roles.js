export const ROLES = {
  STUDENT: 'STUDENT',
  OFFICER: 'OFFICER',
  REGISTRAR: 'REGISTRAR',
  ADMIN: 'ADMIN',
};

const HOME_PATHS = {
  [ROLES.STUDENT]: '/student',
  [ROLES.OFFICER]: '/officer',
  [ROLES.REGISTRAR]: '/registrar',
  [ROLES.ADMIN]: '/admin',
};

export function homePathForRole(role) {
  return HOME_PATHS[role] ?? '/login';
}