import React, { useMemo, useState } from "react";
import {
  users,
  staff,
  students,
  offices,
  officeAssignments,
  clearances,
  clearanceOffices,
  issues,
} from "../../data/mockData";
const CURRENT_OFFICER_ID = 2; 
function getStudent(studentId) {
  return students.find((student) => student.id === studentId);
}
function getOffice(officeId) {
  return offices.find((office) => office.id === officeId);
}
function getClearance(clearanceId) {
  return clearances.find((clearance) => clearance.id === clearanceId);
}
function getStatusClasses(status) {
  switch (status) {
    case "CLEARED":
      return "bg-green-100 text-green-700";
    case "FLAGGED":
      return "bg-red-100 text-red-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
export default function OfficerDashboard() {
  const [search, setSearch] = useState("");
  const currentStaff = staff.find(
    (member) => member.id === CURRENT_OFFICER_ID
  );
  const currentUser = users.find(
    (user) => user.id === currentStaff?.userId
  );
  /*
   * Find all office assignments belonging to this officer.
   */
  const myAssignments = useMemo(() => {
    return officeAssignments.filter(
      (assignment) =>
        assignment.staffId === CURRENT_OFFICER_ID &&
        assignment.isActive
    );
  }, []);

  /*
   * Find clearance-office records assigned to this officer.
   */
  const myClearanceOffices = useMemo(() => {
    return clearanceOffices.filter((record) =>
      myAssignments.some(
        (assignment) =>
          assignment.officeId === record.officeId &&
          record.assignedOfficerId === CURRENT_OFFICER_ID
      )
    );
  }, [myAssignments]);

  /*
   * Search by student ID or student name.
   */
  const filteredClearances = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return myClearanceOffices;
    }

    return myClearanceOffices.filter((record) => {
      const clearance = getClearance(record.clearanceId);
      const student = clearance
        ? getStudent(clearance.studentId)
        : null;

      return (
        student?.studentId.toLowerCase().includes(searchValue) ||
        student?.fullName.toLowerCase().includes(searchValue)
      );
    });
  }, [search, myClearanceOffices]);

  const pendingCount = myClearanceOffices.filter(
    (item) => item.status === "PENDING"
  ).length;

  const clearedCount = myClearanceOffices.filter(
    (item) => item.status === "CLEARED"
  ).length;

  const flaggedCount = myClearanceOffices.filter(
    (item) => item.status === "FLAGGED"
  ).length;

  const openIssuesCount = issues.filter(
    (issue) =>
      issue.status === "OPEN" &&
      myClearanceOffices.some(
        (record) => record.id === issue.clearanceOfficeId
      )
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Officer Portal
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Officer Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your assigned clearance responsibilities.
          </p>
        </div>

        <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">
          <p className="text-sm text-gray-500">
            Logged in as
          </p>

          <p className="font-semibold text-gray-900">
            {currentUser?.name}
          </p>

          <p className="text-sm text-gray-500">
            {currentStaff?.employeeId}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending"
          value={pendingCount}
          description="Waiting for your action"
          icon="⏳"
        />

        <StatCard
          title="Cleared"
          value={clearedCount}
          description="Successfully cleared"
          icon="✓"
        />

        <StatCard
          title="Flagged"
          value={flaggedCount}
          description="Require attention"
          icon="!"
        />

        <StatCard
          title="Open Issues"
          value={openIssuesCount}
          description="Issues assigned to you"
          icon="⚠"
        />
      </div>

      {/* Search */}
      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Find Student
          </h2>

          <p className="text-sm text-gray-500">
            Search your assigned clearance records.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by student ID or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Assigned clearances */}
      <div className="mt-8 rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Assigned Clearances
            </h2>

            <p className="text-sm text-gray-500">
              Students and clearance tasks assigned to your office.
            </p>
          </div>

          <a
            href="/officer/clearances"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            View All
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">
                  Student
                </th>

                <th className="px-6 py-4 font-medium">
                  Office
                </th>

                <th className="px-6 py-4 font-medium">
                  Clearance
                </th>

                <th className="px-6 py-4 font-medium">
                  Status
                </th>

                <th className="px-6 py-4 font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClearances.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No clearance records found.
                  </td>
                </tr>
              ) : (
                filteredClearances.map((record) => {
                  const clearance = getClearance(
                    record.clearanceId
                  );

                  const student = clearance
                    ? getStudent(clearance.studentId)
                    : null;

                  const office = getOffice(record.officeId);

                  return (
                    <tr
                      key={record.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {student?.fullName}
                        </p>

                        <p className="text-sm text-gray-500">
                          {student?.studentId}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {office?.name}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        #{record.clearanceId}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href="/officer/clearances"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}