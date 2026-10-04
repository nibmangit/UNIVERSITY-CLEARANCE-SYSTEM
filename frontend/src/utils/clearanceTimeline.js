import { CLEARANCE_STATUS, ISSUE_STATUS, OFFICE_STATUS, getOfficeProgress } from './status';

function timeOf(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function nextStep(clearance, offices) {
  const openIssues = offices
    .flatMap((office) => office.issues ?? [])
    .filter((issue) => issue.status === ISSUE_STATUS.OPEN).length;
  const progress = getOfficeProgress(offices);

  switch (clearance.status) {
    case CLEARANCE_STATUS.COMPLETED:
      return null;
    case CLEARANCE_STATUS.CANCELLED:
      return { id: 'cancelled', title: 'Clearance cancelled', status: 'alert' };
    case CLEARANCE_STATUS.PENDING_REGISTRAR:
      return { id: 'next', title: 'Waiting for registrar approval', status: 'current' };
    default:
      if (openIssues > 0) {
        return {
          id: 'next',
          title:
            openIssues === 1
              ? 'Waiting for the issue to be resolved'
              : `Waiting for ${openIssues} issues to be resolved`,
          status: 'current',
        };
      }
      if (progress.pending > 0) {
        return {
          id: 'next',
          title: `Waiting for ${progress.pending} ${progress.pending === 1 ? 'office' : 'offices'} to clear you`,
          status: 'current',
        };
      }
      return null;
  }
}


export function buildClearanceTimeline(clearance) {
  const offices = clearance.clearance_offices ?? [];
  const events = [];

  events.push({
    id: 'initiated',
    at: clearance.initiated_at,
    title: 'Clearance initiated',
    description: clearance.initiated_by?.full_name ? `Started by ${clearance.initiated_by.full_name}` : undefined,
    status: 'done',
  });

  for (const item of offices) {
    const officeName = item.office?.name ?? 'Office';

    if (item.status === OFFICE_STATUS.CLEARED && item.reviewed_at) {
      events.push({
        id: `office-${item.id}`,
        at: item.reviewed_at,
        title: `${officeName} cleared`,
        description: item.assigned_officer?.full_name ? `By ${item.assigned_officer.full_name}` : undefined,
        status: 'done',
      });
    }

    for (const issue of item.issues ?? []) {
      events.push({
        id: `issue-${issue.id}`,
        at: issue.created_at,
        title: `${officeName} reported an issue`,
        description: issue.reason,
        status: issue.status === ISSUE_STATUS.OPEN ? 'alert' : 'done',
      });

      if (issue.status === ISSUE_STATUS.RESOLVED && issue.resolved_at) {
        events.push({
          id: `issue-resolved-${issue.id}`,
          at: issue.resolved_at,
          title: `${officeName} resolved the issue`,
          description: issue.resolution_note || undefined,
          status: 'done',
        });
      }
    }
  }

  if (clearance.submitted_at) {
    events.push({
      id: 'submitted',
      at: clearance.submitted_at,
      title: 'All offices cleared',
      description: 'Sent to the registrar for final approval',
      status: 'done',
    });
  }

  if (clearance.completed_at) {
    events.push({
      id: 'completed',
      at: clearance.completed_at,
      title: 'Clearance completed',
      description: clearance.final_approved_by?.full_name
        ? `Approved by ${clearance.final_approved_by.full_name}`
        : undefined,
      status: 'done',
    });
  }

  const dated = events
    .filter((event) => timeOf(event.at) !== null)
    .sort((a, b) => timeOf(a.at) - timeOf(b.at));

  const next = nextStep(clearance, offices);
  return next ? [...dated, next] : dated;
}