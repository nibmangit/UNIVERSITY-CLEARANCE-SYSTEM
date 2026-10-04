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

function getStudentFromIssue(issue) {
  const clearanceOffice = clearanceOffices.find(
    (record) => record.id === issue.clearanceOfficeId
  );

  if (!clearanceOffice) {
    return null;
  }

  const clearance = clearances.find(
    (item) => item.id === clearanceOffice.clearanceId
  );

  if (!clearance) {
    return null;
  }

  return students.find(
    (student) => student.id === clearance.studentId
  );
}

function getOfficeFromIssue(issue) {
  const clearanceOffice = clearanceOffices.find(
    (record) => record.id === issue.clearanceOfficeId
  );

  if (!clearanceOffice) {
    return null;
  }

  return offices.find(
    (office) => office.id === clearanceOffice.officeId
  );
}

function getStatusClasses(status) {
  switch (status) {
    case "OPEN":
      return "bg-red-100 text-red-700";

    case "RESOLVED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function Issues() {
  const [issueList, setIssueList] = useState(issues);

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [search, setSearch] = useState("");

  const [selectedIssue, setSelectedIssue] =
    useState(null);

  const [resolutionNote, setResolutionNote] =
    useState("");

  
    //Find office assignments belonging to current officer.
   
  const myAssignments = useMemo(() => {
    return officeAssignments.filter(
      (assignment) =>
        assignment.staffId === CURRENT_OFFICER_ID &&
        assignment.isActive
    );
  }, []);

  /*
   * Only issues connected to the officer's
   * assigned clearance records.
   */
  const myIssues = useMemo(() => {
    return issueList.filter((issue) => {
      const clearanceOffice =
        clearanceOffices.find(
          (record) =>
            record.id === issue.clearanceOfficeId
        );

      if (!clearanceOffice) {
        return false;
      }

      return myAssignments.some(
        (assignment) =>
          assignment.officeId ===
            clearanceOffice.officeId &&
          clearanceOffice.assignedOfficerId ===
            CURRENT_OFFICER_ID
      );
    });
  }, [issueList, myAssignments]);

  /*
   * Search and filter.
   */
  const filteredIssues = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return myIssues.filter((issue) => {
      const student = getStudentFromIssue(issue);
      const office = getOfficeFromIssue(issue);

      const matchesSearch =
        !searchValue ||
        issue.reason
          .toLowerCase()
          .includes(searchValue) ||
        issue.description
          .toLowerCase()
          .includes(searchValue) ||
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
        issue.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    myIssues,
    search,
    statusFilter,
  ]);

  const openCount = myIssues.filter(
    (issue) => issue.status === "OPEN"
  ).length;

  const resolvedCount = myIssues.filter(
    (issue) => issue.status === "RESOLVED"
  ).length;

  /*
   * Resolve issue.
   */
  const handleResolve = () => {
    if (!selectedIssue) {
      return;
    }

    if (!resolutionNote.trim()) {
      alert("Please enter a resolution note.");
      return;
    }

    setIssueList((previous) =>
      previous.map((issue) =>
        issue.id === selectedIssue.id
          ? {
              ...issue,
              status: "RESOLVED",
              resolvedBy: CURRENT_OFFICER_ID,
              resolvedAt:
                new Date().toISOString(),
              resolutionNote,
            }
          : issue
      )
    );

    setSelectedIssue(null);
    setResolutionNote("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500">
          Officer Portal
        </p>

        <h1 className="text-3xl font-bold text-gray-900">
          Issues
        </h1>

        <p className="mt-1 text-gray-500">
          Review and resolve issues related to your
          clearance responsibilities.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Open Issues
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {openCount}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Resolved Issues
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {resolvedCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search issues, students, or offices..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Issues</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="font-semibold text-gray-900">
            Clearance Issues
          </h2>

          <p className="text-sm text-gray-500">
            {filteredIssues.length} issues found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-6 py-4">
                  Student
                </th>

                <th className="px-6 py-4">
                  Office
                </th>

                <th className="px-6 py-4">
                  Issue
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Created
                </th>

                <th className="px-6 py-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No issues found.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const student =
                    getStudentFromIssue(issue);

                  const office =
                    getOfficeFromIssue(issue);

                  return (
                    <tr
                      key={issue.id}
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

                      <td className="max-w-xs px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {issue.reason}
                        </p>

                        <p className="truncate text-sm text-gray-500">
                          {issue.description}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            issue.status
                          )}`}
                        >
                          {issue.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          issue.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            setSelectedIssue(issue)
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Issue Details
                </h2>

                <p className="text-sm text-gray-500">
                  Issue #{selectedIssue.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedIssue(null)
                }
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              {(() => {
                const student =
                  getStudentFromIssue(
                    selectedIssue
                  );

                const office =
                  getOfficeFromIssue(
                    selectedIssue
                  );

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Student
                        </p>

                        <p className="mt-1 font-medium">
                          {student?.fullName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Student ID
                        </p>

                        <p className="mt-1 font-medium">
                          {student?.studentId}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Office
                        </p>

                        <p className="mt-1 font-medium">
                          {office?.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Status
                        </p>

                        <span
                          className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            selectedIssue.status
                          )}`}
                        >
                          {selectedIssue.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Reason
                      </p>

                      <p className="mt-1 text-gray-900">
                        {selectedIssue.reason}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Description
                      </p>

                      <p className="mt-1 text-gray-600">
                        {selectedIssue.description}
                      </p>
                    </div>

                    {selectedIssue.status ===
                    "RESOLVED" ? (
                      <div className="rounded-xl bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                          Resolution
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          {
                            selectedIssue.resolutionNote
                          }
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Resolution Note
                          </label>

                          <textarea
                            rows="4"
                            value={resolutionNote}
                            onChange={(e) =>
                              setResolutionNote(
                                e.target.value
                              )
                            }
                            placeholder="Explain how the issue was resolved..."
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                          />
                        </div>

                        <button
                          onClick={handleResolve}
                          className="w-full rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
                        >
                          ✓ Resolve Issue
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}