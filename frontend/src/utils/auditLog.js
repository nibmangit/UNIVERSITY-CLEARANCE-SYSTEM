export const ROLE_LABELS = {
  STUDENT: 'Student',
  OFFICER: 'Officer',
  REGISTRAR: 'Registrar',
  ADMIN: 'Admin',
};

// Colour of each action's badge and bar. An action not listed here gets a grey one.
export const ACTION_TONES = {
  OFFICER_CLEARED_OFFICE: 'emerald',
  OFFICER_FLAGGED_OFFICE: 'red',
  OFFICER_RESOLVED_ISSUE: 'sky',
  REGISTRAR_INITIATED_CLEARANCE: 'slate',
  REGISTRAR_FINAL_APPROVAL: 'emerald',
  DOCUMENT_DOWNLOADED: 'sky',
};

/** "OFFICER_CLEARED_OFFICE" becomes "Officer cleared office" */
export function humanizeAction(code) {
  const text = String(code).toLowerCase().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "ClearanceOffice" becomes "Clearance Office" */
export function entityLabel(type) {
  return String(type).replace(/([a-z])([A-Z])/g, '$1 $2');
}