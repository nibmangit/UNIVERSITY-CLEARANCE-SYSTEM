// DEVELOPMENT ONLY. Mirrors the accounts created by `python manage.py seed_data`.
// Login.jsx loads this file only in development, so it never ends up in a production build.

export const DEV_PASSWORD = 'Clearance@2026';

const DEPARTMENTS = [
  'Software Engineering',
  'Computer Science',
  'Accounting and Finance',
  'Management',
];

// The seed puts six students in each department, in this section order.
const SECTIONS = ['3A', '3A', '3B', '3B', '4A', '4A'];

const STUDENT_NAMES = [
  'Abebe Kebede', 'Mahlet Tesfaye', 'Samuel Bekele', 'Marta Girma', 'Dawit Tadesse', 'Selam Haile',
  'Yonas Mengistu', 'Tigist Worku', 'Kidus Assefa', 'Ruth Demissie', 'Nathnael Getachew', 'Bethlehem Lemma',
  'Henok Alemayehu', 'Meron Solomon', 'Biniyam Tefera', 'Saron Abate', 'Eyob Kassa', 'Liya Fikadu',
  'Robel Negash', 'Eden Zewdu', 'Mikias Tilahu', 'Rediet Yilma', 'Fitsum Berhane', 'Helen Desta',
];

const STAFF = [
  { group: 'Registrar', id: 'REG001', name: 'Mulugeta Tesema', detail: 'Registrar' },
  { group: 'Officers', id: 'ADV001', name: 'Dr. Hana Alemu', detail: 'Advisor' },
  { group: 'Officers', id: 'LIB001', name: 'Tsegaye Wolde', detail: 'Library' },
  { group: 'Officers', id: 'DOR001', name: 'Birtukan Shiferaw', detail: 'Dormitory' },
  { group: 'Officers', id: 'SPO001', name: 'Getnet Abera', detail: 'Sport Office' },
  { group: 'Officers', id: 'CAF001', name: 'Almaz Teshome', detail: 'Café' },
  { group: 'Officers', id: 'STO001', name: 'Zerihun Mekonnen', detail: 'Faculty Store' },
  { group: 'Admin', id: 'ADM001', name: 'Yohannes Admasu', detail: 'Administrator' },
];

const STUDENTS = STUDENT_NAMES.map((name, index) => ({
  group: 'Students',
  id: `BDU${String(index + 1).padStart(5, '0')}`,
  name,
  detail: `${DEPARTMENTS[Math.floor(index / 6) % DEPARTMENTS.length]} · Section ${SECTIONS[index % SECTIONS.length]}`,
}));

export const DEV_ACCOUNTS = [...STAFF, ...STUDENTS];