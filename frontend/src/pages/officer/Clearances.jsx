import React, { useMemo, useState } from "react";

import {
  students,
  offices,
  clearances,
  clearanceOffices,
  issues,
  officeAssignments,
} from "../../data/mockData";

const CURRENT_OFFICER_ID = 2; 

function getStudent(studentId) {
  return students.find((student) => student.id === studentId);
}

function getOffice(officeId) {
  return offices.find((office) => office.id === officeId);
}

function getClearance(clearanceId) {
  return clearances.find(
    (clearance) => clearance.id === clearanceId
  );
}

function getStatusClasses(status) {
  switch (status) {
    case "CLEARED":
      return "bg-green-100 text-green-700";

    case "FLAGGED":
      return "bg-red-100 text-red-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function Clearances() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [records, setRecords] = useState(clearanceOffices);

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const [showIssueModal, setShowIssueModal] =
    useState(false);

  const [issueReason, setIssueReason] = useState("");
  const [issueDescription, setIssueDescription] =
    useState("");

  /*
   * Find office assignments belonging to current officer.
   */
  const myAssignments = useMemo(() => {
    return officeAssignments.filter(
      (assignment) =>
        assignment.staffId === CURRENT_OFFICER_ID &&
        assignment.isActive
    );
  }, []);

  /*
   * Only show records assigned to current officer.
   */
  const myRecords = useMemo(() => {
    return records.filter((record) =>
      myAssignments.some(
        (assignment) =>
          assignment.officeId === record.officeId &&
          record.assignedOfficerId === CURRENT_OFFICER_ID
      )
    );
  }, [records, myAssignments]);

  /*
   * Search and filter.
   */
  const filteredRecords = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return myRecords.filter((record) => {
      const clearance = getClearance(record.clearanceId);

      const student = clearance
        ? getStudent(clearance.studentId)
        : null;

      const office = getOffice(record.officeId);

      const matchesSearch =
        !searchValue ||
        student?.fullName
          .toLowerCase()
          .includes(searchValue) ||
        student?.studentId
          .toLowerCase()
          .includes(searchValue) ||
        office?.name
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    myRecords,
    search,
    statusFilter,
  ]);

  /*
   * Clear student.
   */
  const handleClear = (recordId) => {
    setRecords((previous) =>
      previous.map((record) =>
        record.id === recordId
          ? {
              ...record,
              status: "CLEARED",
              notes: "Student cleared by officer.",
              reviewedAt: new Date().toISOString(),
            }
          : record
      )
    );

    setSelectedRecord(null);
  };

  /*
   * Create issue.
   */
  const handleCreateIssue = () => {
    if (!issueReason.trim()) {
      alert("Please enter an issue reason.");
      return;
    }

    if (!selectedRecord) {
      return;
    }

    const newIssue = {
      id: Date.now(),
      clearanceOfficeId: selectedRecord.id,
      reason: issueReason,
      description: issueDescription,
      status: "OPEN",
      createdBy: CURRENT_OFFICER_ID,
      createdAt: new Date().toISOString(),
      resolvedBy: null,
      resolvedAt: null,
      resolutionNote: null,
    };

    /*
     * Since this is mock data, we cannot mutate
     * the imported issues array directly.
     *
     * The real backend will POST this issue.
     */
    issues.push(newIssue);

    setRecords((previous) =>
      previous.map((record) =>
        record.id === selectedRecord.id
          ? {
              ...record,
              status: "FLAGGED",
              notes: issueReason,
              reviewedAt: new Date().toISOString(),
            }
          : record
      )
    );

    setIssueReason("");
    setIssueDescription("");
    setShowIssueModal(false);
    setSelectedRecord(null);

    alert("Issue created successfully.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500">
          Officer Portal
        </p>

        <h1 className="text-3xl font-bold text-gray-900">
          Clearances
        </h1>

        <p className="mt-1 text-gray-500">
          Manage students assigned to your office.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search student or office..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="FLAGGED">Flagged</option>
            <option value="CLEARED">Cleared</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="font-semibold text-gray-900">
            Assigned Students
          </h2>

          <p className="text-sm text-gray-500">
            {filteredRecords.length} records found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Office</th>
                <th className="px-6 py-4">Clearance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => {
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

                    <td className="px-6 py-4">
                      {office?.name}
                    </td>

                    <td className="px-6 py-4">
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
                      <button
                        onClick={() =>
                          setSelectedRecord(record)
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Clearance Details
                </h2>

                <p className="text-sm text-gray-500">
                  Record #{selectedRecord.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              {(() => {
                const clearance = getClearance(
                  selectedRecord.clearanceId
                );

                const student = clearance
                  ? getStudent(clearance.studentId)
                  : null;

                const office = getOffice(
                  selectedRecord.officeId
                );

                return (
                  <>
                    {/* Student */}
                    <div className="rounded-xl bg-gray-50 p-5">
                      <h3 className="mb-3 font-semibold">
                        Student Information
                      </h3>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Info
                          label="Name"
                          value={student?.fullName}
                        />

                        <Info
                          label="Student ID"
                          value={student?.studentId}
                        />

                        <Info
                          label="Email"
                          value={student?.email}
                        />

                        <Info
                          label="Phone"
                          value={student?.phone}
                        />
                      </div>
                    </div>

                    {/* Clearance */}
                    <div className="rounded-xl border p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Office Clearance
                          </h3>

                          <p className="text-sm text-gray-500">
                            {office?.name}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            selectedRecord.status
                          )}`}
                        >
                          {selectedRecord.status}
                        </span>
                      </div>

                      {selectedRecord.notes && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                          <strong>Notes:</strong>{" "}
                          {selectedRecord.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {selectedRecord.status !==
                      "CLEARED" && (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() =>
                            handleClear(
                              selectedRecord.id
                            )
                          }
                          className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
                        >
                          ✓ Clear Student
                        </button>

                        <button
                          onClick={() =>
                            setShowIssueModal(true)
                          }
                          className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
                        >
                          ⚠ Flag Issue
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && selectedRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="border-b p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Flag Clearance Issue
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Create an issue for this student's clearance.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Reason
                </label>

                <input
                  type="text"
                  value={issueReason}
                  onChange={(e) =>
                    setIssueReason(e.target.value)
                  }
                  placeholder="Example: Unreturned room key"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  rows="4"
                  value={issueDescription}
                  onChange={(e) =>
                    setIssueDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe the issue..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowIssueModal(false);
                    setIssueReason("");
                    setIssueDescription("");
                  }}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateIssue}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
                >
                  Create Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
}