// UNIVERSITY CLEARANCE SYSTEM
// MOCK DATA 

 
//this data is assumed to be owned by the current university system.


// USERS
export const users = [
  {
    id: 1,
    username: "BDU00123",
    role: "STUDENT",
    name: "Abebe Kebede",
  },
  {
    id: 2,
    username: "BDU00124",
    role: "STUDENT",
    name: "Mekdes Alemu",
  },
  {
    id: 3,
    username: "BDU00125",
    role: "STUDENT",
    name: "Dawit Tadesse",
  },

  {
    id: 101,
    username: "OFF001",
    role: "OFFICER",
    name: "Hana Alemu",
  },
  {
    id: 102,
    username: "OFF002",
    role: "OFFICER",
    name: "Samuel Bekele",
  },
  {
    id: 103,
    username: "OFF003",
    role: "OFFICER",
    name: "Mimi Worku",
  },

  {
    id: 201,
    username: "REG001",
    role: "REGISTRAR",
    name: "Kebede Tadesse",
  },

  {
    id: 301,
    username: "ADM001",
    role: "ADMIN",
    name: "Dawit Bekele",
  },
];

// FACULTIES
export const faculties = [
  {
    id: 1,
    name: "Faculty of Computing",
    code: "FC",
    isActive: true,
  },
  {
    id: 2,
    name: "Faculty of Engineering",
    code: "FE",
    isActive: true,
  },
  {
    id: 3,
    name: "Faculty of Business",
    code: "FB",
    isActive: true,
  },
];

// DEPARTMENTS 
export const departments = [
  {
    id: 1,
    facultyId: 1,
    name: "Software Engineering",
    code: "SE",
    isActive: true,
  },
  {
    id: 2,
    facultyId: 1,
    name: "Computer Science",
    code: "CS",
    isActive: true,
  },
  {
    id: 3,
    facultyId: 2,
    name: "Electrical Engineering",
    code: "EE",
    isActive: true,
  },
  {
    id: 4,
    facultyId: 3,
    name: "Accounting",
    code: "ACC",
    isActive: true,
  },
];

// SECTIONS
export const sections = [
  {
    id: 1,
    departmentId: 1,
    name: "Section A",
    year: 3,
    isActive: true,
  },
  {
    id: 2,
    departmentId: 1,
    name: "Section B",
    year: 3,
    isActive: true,
  },
  {
    id: 3,
    departmentId: 2,
    name: "Section A",
    year: 4,
    isActive: true,
  },
  {
    id: 4,
    departmentId: 3,
    name: "Section A",
    year: 4,
    isActive: true,
  },
  {
    id: 5,
    departmentId: 4,
    name: "Section A",
    year: 4,
    isActive: true,
  },
];

// STUDENTS
export const students = [
  {
    id: 1,
    userId: 1,

    studentId: "BDU00123",
    fullName: "Abebe Kebede",

    facultyId: 1,
    departmentId: 1,
    sectionId: 1,

    year: 3,

    email: "abebe@bdu.edu.et",
    phone: "+251911111111",
  },

  {
    id: 2,
    userId: 2,

    studentId: "BDU00124",
    fullName: "Mekdes Alemu",

    facultyId: 1,
    departmentId: 2,
    sectionId: 3,

    year: 4,

    email: "mekdes@bdu.edu.et",
    phone: "+251922222222",
  },

  {
    id: 3,
    userId: 3,

    studentId: "BDU00125",
    fullName: "Dawit Tadesse",

    facultyId: 2,
    departmentId: 3,
    sectionId: 4,

    year: 4,

    email: "dawit@bdu.edu.et",
    phone: "+251933333333",
  },
];

// STAFF
export const staff = [
  {
    id: 1,
    userId: 101,
    employeeId: "EMP001",
    fullName: "Hana Alemu",
    email: "hana@bdu.edu.et",
    phone: "+251911000001",
    isActive: true,
  },

  {
    id: 2,
    userId: 102,
    employeeId: "EMP002",
    fullName: "Samuel Bekele",
    email: "samuel@bdu.edu.et",
    phone: "+251911000002",
    isActive: true,
  },

  {
    id: 3,
    userId: 103,
    employeeId: "EMP003",
    fullName: "Mimi Worku",
    email: "mimi@bdu.edu.et",
    phone: "+251911000003",
    isActive: true,
  },

  {
    id: 4,
    userId: 201,
    employeeId: "REG001",
    fullName: "Kebede Tadesse",
    email: "kebede@bdu.edu.et",
    phone: "+251911000004",
    isActive: true,
  },

  {
    id: 5,
    userId: 301,
    employeeId: "ADM001",
    fullName: "Dawit Bekele",
    email: "dawit.b@bdu.edu.et",
    phone: "+251911000005",
    isActive: true,
  },
];


//the data below is owend by our system.

// OFFICES
export const offices = [
  {
    id: 1,
    name: "Advisor",
    code: "ADVISOR",
    description: "Academic advisor clearance.",
    isActive: true,
  },

  {
    id: 2,
    name: "Library",
    code: "LIBRARY",
    description: "Library clearance.",
    isActive: true,
  },

  {
    id: 3,
    name: "Dormitory",
    code: "DORMITORY",
    description: "Dormitory clearance.",
    isActive: true,
  },

  {
    id: 4,
    name: "Sport Office",
    code: "SPORT",
    description: "Sport office clearance.",
    isActive: true,
  },

  {
    id: 5,
    name: "Café",
    code: "CAFE",
    description: "Café clearance.",
    isActive: true,
  },

  {
    id: 6,
    name: "Faculty Store",
    code: "FACULTY_STORE",
    description: "Faculty store clearance.",
    isActive: true,
  },
];

// OFFICE ASSIGNMENTS
export const officeAssignments = [
  // Advisor - Software Engineering
  {
    id: 1,
    staffId: 1,
    officeId: 1,
    facultyId: 1,
    departmentId: 1,
    sectionId: 1,
    isActive: true,
  },

  // Advisor - Computer Science
  {
    id: 2,
    staffId: 2,
    officeId: 1,
    facultyId: 1,
    departmentId: 2,
    sectionId: 3,
    isActive: true,
  },

  // Advisor - Electrical Engineering
  {
    id: 3,
    staffId: 3,
    officeId: 1,
    facultyId: 2,
    departmentId: 3,
    sectionId: 4,
    isActive: true,
  },

  // Library
  {
    id: 4,
    staffId: 1,
    officeId: 2,
    facultyId: null,
    departmentId: null,
    sectionId: null,
    isActive: true,
  },

  // Dormitory
  {
    id: 5,
    staffId: 2,
    officeId: 3,
    facultyId: null,
    departmentId: null,
    sectionId: null,
    isActive: true,
  },

  // Sport Office
  {
    id: 6,
    staffId: 3,
    officeId: 4,
    facultyId: null,
    departmentId: null,
    sectionId: null,
    isActive: true,
  },

  // Café
  {
    id: 7,
    staffId: 1,
    officeId: 5,
    facultyId: null,
    departmentId: null,
    sectionId: null,
    isActive: true,
  },

  // Faculty Store - Computing
  {
    id: 8,
    staffId: 2,
    officeId: 6,
    facultyId: 1,
    departmentId: null,
    sectionId: null,
    isActive: true,
  },

  // Faculty Store - Engineering
  {
    id: 9,
    staffId: 3,
    officeId: 6,
    facultyId: 2,
    departmentId: null,
    sectionId: null,
    isActive: true,
  },
];

// CLEARANCE TYPES
export const clearanceTypes = [
  {
    id: 1,
    name: "End of Year",
    description: "Clearance at the end of an academic year.",
    isActive: true,
  },

  {
    id: 2,
    name: "Withdrawal",
    description: "Clearance for students withdrawing.",
    isActive: true,
  },

  {
    id: 3,
    name: "Graduation",
    description: "Final clearance before graduation.",
    isActive: true,
  },

  {
    id: 4,
    name: "Other",
    description: "Other clearance purposes.",
    isActive: true,
  },
];

// CLEARANCES
export const clearances = [
  {
    id: 101,

    studentId: 1,
    clearanceTypeId: 1,

    status: "IN_PROGRESS",

    initiatedBy: 4,
    initiatedAt: "2026-09-15T09:30:00",

    submittedAt: "2026-09-15T10:15:00",

    finalApprovedBy: null,
    finalApprovedAt: null,
    completedAt: null,
  },

  {
    id: 102,

    studentId: 2,
    clearanceTypeId: 3,

    status: "PENDING_REGISTRAR",

    initiatedBy: 4,
    initiatedAt: "2026-09-10T09:00:00",

    submittedAt: "2026-09-10T10:00:00",

    finalApprovedBy: null,
    finalApprovedAt: null,
    completedAt: null,
  },

  {
    id: 103,

    studentId: 3,
    clearanceTypeId: 3,

    status: "COMPLETED",

    initiatedBy: 4,
    initiatedAt: "2026-08-20T09:00:00",

    submittedAt: "2026-08-20T10:00:00",

    finalApprovedBy: 4,
    finalApprovedAt: "2026-08-25T14:00:00",

    completedAt: "2026-08-25T14:00:00",
  },
];

// CLEARANCE OFFICE RECORDS
export const clearanceOffices = [

  // ==========================================================
  // CLEARANCE 101 - ABEBE
  // ==========================================================

  {
    id: 1001,
    clearanceId: 101,
    officeId: 1,
    assignedOfficerId: 1,
    status: "CLEARED",
    notes: "Student cleared by advisor.",
    reviewedAt: "2026-09-16T09:00:00",
  },

  {
    id: 1002,
    clearanceId: 101,
    officeId: 2,
    assignedOfficerId: 1,
    status: "CLEARED",
    notes: "No outstanding library materials.",
    reviewedAt: "2026-09-16T10:00:00",
  },

  {
    id: 1003,
    clearanceId: 101,
    officeId: 3,
    assignedOfficerId: 2,
    status: "FLAGGED",
    notes: null,
    reviewedAt: "2026-09-16T11:00:00",
  },

  {
    id: 1004,
    clearanceId: 101,
    officeId: 4,
    assignedOfficerId: 3,
    status: "PENDING",
    notes: null,
    reviewedAt: null,
  },

  {
    id: 1005,
    clearanceId: 101,
    officeId: 5,
    assignedOfficerId: 1,
    status: "PENDING",
    notes: null,
    reviewedAt: null,
  },

  {
    id: 1006,
    clearanceId: 101,
    officeId: 6,
    assignedOfficerId: 2,
    status: "PENDING",
    notes: null,
    reviewedAt: null,
  },


  // ==========================================================
  // CLEARANCE 102 - MEKDES
  // ==========================================================

  {
    id: 2001,
    clearanceId: 102,
    officeId: 1,
    assignedOfficerId: 2,
    status: "CLEARED",
    notes: "Advisor clearance completed.",
    reviewedAt: "2026-09-11T09:00:00",
  },

  {
    id: 2002,
    clearanceId: 102,
    officeId: 2,
    assignedOfficerId: 1,
    status: "CLEARED",
    notes: "Library clearance completed.",
    reviewedAt: "2026-09-11T10:00:00",
  },

  {
    id: 2003,
    clearanceId: 102,
    officeId: 3,
    assignedOfficerId: 2,
    status: "CLEARED",
    notes: "Dormitory clearance completed.",
    reviewedAt: "2026-09-11T11:00:00",
  },

  {
    id: 2004,
    clearanceId: 102,
    officeId: 4,
    assignedOfficerId: 3,
    status: "CLEARED",
    notes: "Sport clearance completed.",
    reviewedAt: "2026-09-12T09:00:00",
  },

  {
    id: 2005,
    clearanceId: 102,
    officeId: 5,
    assignedOfficerId: 1,
    status: "CLEARED",
    notes: "No outstanding café balance.",
    reviewedAt: "2026-09-12T10:00:00",
  },

  {
    id: 2006,
    clearanceId: 102,
    officeId: 6,
    assignedOfficerId: 2,
    status: "CLEARED",
    notes: "Faculty store clearance completed.",
    reviewedAt: "2026-09-12T11:00:00",
  },


  // ==========================================================
  // CLEARANCE 103 - DAWIT
  // ==========================================================

  {
    id: 3001,
    clearanceId: 103,
    officeId: 1,
    assignedOfficerId: 3,
    status: "CLEARED",
    notes: "Advisor clearance completed.",
    reviewedAt: "2026-08-22T09:00:00",
  },

  {
    id: 3002,
    clearanceId: 103,
    officeId: 2,
    assignedOfficerId: 1,
    status: "CLEARED",
    notes: "Library clearance completed.",
    reviewedAt: "2026-08-22T10:00:00",
  },

  {
    id: 3003,
    clearanceId: 103,
    officeId: 3,
    assignedOfficerId: 2,
    status: "CLEARED",
    notes: "Dormitory clearance completed.",
    reviewedAt: "2026-08-23T09:00:00",
  },

  {
    id: 3004,
    clearanceId: 103,
    officeId: 4,
    assignedOfficerId: 3,
    status: "CLEARED",
    notes: "Sport clearance completed.",
    reviewedAt: "2026-08-23T10:00:00",
  },

  {
    id: 3005,
    clearanceId: 103,
    officeId: 5,
    assignedOfficerId: 1,
    status: "CLEARED",
    notes: "Café clearance completed.",
    reviewedAt: "2026-08-24T09:00:00",
  },

  {
    id: 3006,
    clearanceId: 103,
    officeId: 6,
    assignedOfficerId: 2,
    status: "CLEARED",
    notes: "Faculty store clearance completed.",
    reviewedAt: "2026-08-24T10:00:00",
  },
];

// ISSUES
export const issues = [
  {
    id: 1,

    clearanceOfficeId: 1003,

    reason: "Unreturned room key",

    description:
      "The student has not returned the room key assigned to them.",

    status: "OPEN",

    createdBy: 2,
    createdAt: "2026-09-16T11:00:00",

    resolvedBy: null,
    resolvedAt: null,

    resolutionNote: null,
  },

  {
    id: 2,

    clearanceOfficeId: 2005,

    reason: "Outstanding café balance",

    description:
      "The student has an outstanding balance at the university café.",

    status: "RESOLVED",

    createdBy: 1,
    createdAt: "2026-09-12T09:30:00",

    resolvedBy: 1,
    resolvedAt: "2026-09-13T14:00:00",

    resolutionNote:
      "Outstanding balance was paid by the student.",
  },
];

// NOTIFICATIONS 
export const notifications = [
  {
    id: 1,

    userId: 1,

    title: "Clearance Initiated",

    message:
      "Your clearance has been initiated by the Registrar.",

    type: "CLEARANCE",

    isRead: false,

    clearanceId: 101,
    issueId: null,

    createdAt: "2026-09-15T09:35:00",
  },

  {
    id: 2,

    userId: 1,

    title: "Clearance Issue",

    message:
      "The Dormitory office has reported an issue with your clearance.",

    type: "ISSUE",

    isRead: false,

    clearanceId: 101,
    issueId: 1,

    createdAt: "2026-09-16T11:05:00",
  },

  {
    id: 3,

    userId: 2,

    title: "Clearance Ready for Final Approval",

    message:
      "All required offices have cleared your graduation clearance. It is now waiting for Registrar approval.",

    type: "CLEARANCE",

    isRead: true,

    clearanceId: 102,
    issueId: null,

    createdAt: "2026-09-13T15:00:00",
  },

  {
    id: 4,

    userId: 3,

    title: "Clearance Completed",

    message:
      "Your graduation clearance has been completed successfully.",

    type: "CLEARANCE",

    isRead: true,

    clearanceId: 103,
    issueId: null,

    createdAt: "2026-08-25T14:05:00",
  },
];

// AUDIT LOGS
export const auditLogs = [
  {
    id: 1,

    userId: 4,

    action: "CLEARANCE_INITIATED",

    description:
      "Registrar initiated clearance for BDU00123.",

    entityType: "Clearance",
    entityId: 101,

    createdAt: "2026-09-15T09:30:00",
  },

  {
    id: 2,

    userId: 2,

    action: "ISSUE_CREATED",

    description:
      "Dormitory officer created an issue for BDU00123.",

    entityType: "Issue",
    entityId: 1,

    createdAt: "2026-09-16T11:00:00",
  },

  {
    id: 3,

    userId: 1,

    action: "ISSUE_RESOLVED",

    description:
      "Café issue for BDU00124 was resolved.",

    entityType: "Issue",
    entityId: 2,

    createdAt: "2026-09-13T14:00:00",
  },

  {
    id: 4,

    userId: 4,

    action: "CLEARANCE_APPROVED",

    description:
      "Registrar approved clearance for BDU00125.",

    entityType: "Clearance",
    entityId: 103,

    createdAt: "2026-08-25T14:00:00",
  },
];



//for our project this is the overall relationship between the entities in our system.