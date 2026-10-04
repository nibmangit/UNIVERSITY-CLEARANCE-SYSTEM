
export const CLEARANCE_STATUS = {
  INITIATED: 'INITIATED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_REGISTRAR: 'PENDING_REGISTRAR',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const OFFICE_STATUS = {
  PENDING: 'PENDING',
  CLEARED: 'CLEARED',
  FLAGGED: 'FLAGGED',
};

export const ISSUE_STATUS = {
  OPEN: 'OPEN',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
};

export const CLEARANCE_STATUS_LABEL = {
  INITIATED: 'Initiated',
  IN_PROGRESS: 'In progress',
  PENDING_REGISTRAR: 'Pending registrar',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const OFFICE_STATUS_LABEL = {
  PENDING: 'Pending',
  CLEARED: 'Cleared',
  FLAGGED: 'Flagged',
};

export const ISSUE_STATUS_LABEL = {
  OPEN: 'Open',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
};


export const STATUS_TONE = {
  INITIATED: 'slate',
  IN_PROGRESS: 'sky',
  PENDING_REGISTRAR: 'amber',
  COMPLETED: 'emerald',
  CANCELLED: 'slate',
  PENDING: 'slate',
  CLEARED: 'emerald',
  FLAGGED: 'red',
  OPEN: 'red',
  RESOLVED: 'emerald',
};

const ALL_LABELS = {
  ...CLEARANCE_STATUS_LABEL,
  ...OFFICE_STATUS_LABEL,
  ...ISSUE_STATUS_LABEL,
};

export function getStatusLabel(status) {
  if (ALL_LABELS[status]) return ALL_LABELS[status];
  if (!status) return '—';
  const text = String(status).toLowerCase().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getStatusTone(status) {
  return STATUS_TONE[status] ?? 'slate';
}

/** Summarises a clearance's `clearance_offices` array (used by the progress component). */
export function getOfficeProgress(clearanceOffices = []) {
  const total = clearanceOffices.length;
  const count = (status) => clearanceOffices.filter((office) => office.status === status).length;

  const cleared = count(OFFICE_STATUS.CLEARED);
  const flagged = count(OFFICE_STATUS.FLAGGED);
  const pending = count(OFFICE_STATUS.PENDING);

  return {
    total,
    cleared,
    flagged,
    pending,
    percent: total === 0 ? 0 : Math.round((cleared / total) * 100),
    allCleared: total > 0 && cleared === total,
  };
}