import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DetailList from '../../components/ui/DetailList';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import StatusBadge from '../../components/ui/StatusBadge';
import Table from '../../components/ui/Table';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import { accountsService } from '../../services/accountsService';
import { clearanceService } from '../../services/clearanceService';
import { getErrorMessage } from '../../utils/errors';

const PAGE_SIZE = 10;

function buildColumns(onInitiate) {
  return [
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.full_name}</p>
          <p className="text-xs text-slate-500">{row.student_id}</p>
        </div>
      ),
    },
    {
      key: 'academic',
      header: 'Academic',
      render: (row) => (
        <div>
          <p>{row.faculty}</p>
          <p className="text-xs text-slate-500">
            {row.department} · Section {row.section} · Year {row.year}
          </p>
        </div>
      ),
    },
    {
      key: 'clearance',
      header: 'Existing clearance',
      render: (row) =>
        row.active_clearance ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusBadge status={row.active_clearance.status} />
            <span className="text-xs text-slate-500">
              #{row.active_clearance.id} · {row.active_clearance.clearance_type?.name}
            </span>
          </div>
        ) : (
          <span className="text-slate-500">None</span>
        ),
    },
    {
      key: 'action',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (row) =>
        row.active_clearance ? (
          <Button to={`/registrar/clearances/${row.active_clearance.id}`} size="sm" variant="secondary">
            View clearance
            <span className="sr-only"> for {row.full_name}</span>
          </Button>
        ) : (
          <Button size="sm" onClick={() => onInitiate(row)}>
            Initiate clearance
            <span className="sr-only"> for {row.full_name}</span>
          </Button>
        ),
    },
  ];
}

// Mounted only while open, so the form starts fresh every time.
function InitiateModal({ student, onClose, onCreated, onStale }) {
  const { data: types, loading, error, reload } = useApi(clearanceService.listTypes);
  const [selected, setSelected] = useState('');
  const [typeError, setTypeError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const options = (types ?? []).map((type) => ({ value: String(type.id), label: type.name }));
  // With a single type there is nothing to choose, so it is picked for you.
  const typeId = selected || (options.length === 1 ? options[0].value : '');
  const typesReady = !loading && !error && options.length > 0;

  async function submit(event) {
    event.preventDefault();
    setSubmitError('');

    if (!typeId) {
      setTypeError('Please select a clearance type.');
      return;
    }
    setTypeError('');

    setSubmitting(true);
    try {
      const created = await clearanceService.create({
        studentId: student.student_id,
        clearanceTypeId: Number(typeId),
      });
      onCreated(created);
    } catch (err) {
      const fieldError = err.fieldErrors?.clearance_type_id;
      if (fieldError) setTypeError(fieldError);
      else setSubmitError(getErrorMessage(err));
      setSubmitting(false);
      // For example: the student already got an active clearance in another tab.
      if (err.status === 400) onStale();
    }
  }

  return (
    <Modal
      open
      title="Initiate clearance"
      description={`${student.full_name} · ${student.student_id}`}
      onClose={onClose}
      busy={submitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="initiate-form" loading={submitting} disabled={!typesReady}>
            Initiate clearance
          </Button>
        </>
      }
    >
      <form id="initiate-form" onSubmit={submit} noValidate className="space-y-5">
        {error ? (
          <Alert tone="error">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{getErrorMessage(error)}</span>
              <Button size="sm" variant="secondary" onClick={reload}>
                Try again
              </Button>
            </div>
          </Alert>
        ) : !loading && options.length === 0 ? (
          <Alert tone="warning">
            No clearance types are set up yet. Add one in the Django admin, then try again.
          </Alert>
        ) : (
          <Select
            label="Clearance type"
            required
            placeholder={loading ? 'Loading…' : 'Select a type'}
            options={options}
            value={typeId}
            disabled={loading}
            onChange={(event) => setSelected(event.target.value)}
            error={typeError}
          />
        )}

        <div>
          <p className="mb-3 text-sm font-medium text-slate-900">Confirm student information</p>
          <DetailList
            columns={2}
            items={[
              { label: 'Faculty', value: student.faculty },
              { label: 'Department', value: student.department },
              { label: 'Section', value: student.section },
              { label: 'Year', value: student.year },
            ]}
          />
        </div>

        <Alert>
          This creates the clearance for all six offices and assigns an officer to each. The student is
          notified.
        </Alert>

        {submitError && <Alert tone="error">{submitError}</Alert>}
      </form>
    </Modal>
  );
}

export default function Students() {
  const navigate = useNavigate();
  const toast = useToast();

  const [term, setTerm] = useState('');
  const [termError, setTermError] = useState('');
  const [search, setSearch] = useState({ status: 'loading', term: '', results: [], error: null });
  const [initiating, setInitiating] = useState(null);
  const latestRequest = useRef(0);

  const { page, setPage, pageItems, total } = usePagination(search.results, PAGE_SIZE);

  const runSearch = useCallback((value = '') => {
    const id = ++latestRequest.current;
    setSearch((previous) => ({ ...previous, status: 'loading', term: value, error: null }));

    accountsService
      .listStudents(value)
      .then((results) => {
        if (id === latestRequest.current) setSearch({ status: 'done', term: value, results, error: null });
      })
      .catch((error) => {
        if (id === latestRequest.current) setSearch({ status: 'error', term: value, results: [], error });
      });
  }, []);

  // Automatically load all students on first render
  useEffect(() => {
    runSearch('');
  }, [runSearch]);

  function handleSubmit(event) {
    event.preventDefault();
    const value = term.trim();

    if (!value) {
      setTermError('Enter a student ID or name.');
      return;
    }

    setTermError('');
    setPage(1);
    runSearch(value);
  }

  function handleCreated(created) {
    const name = initiating?.full_name;
    setInitiating(null);
    toast.success(`Clearance initiated for ${name}.`);
    navigate(`/registrar/clearances/${created.id}`);
  }

  const columns = buildColumns(setInitiating);
  const searching = search.status === 'loading';

  let results;

  if (search.status === 'idle') {
    results = (
      <Card>
        <EmptyState
          title="Search for a student"
          message="Enter a student ID or part of a name, then press Search."
        />
      </Card>
    );
  } else if (search.status === 'error') {
    results = (
      <Card>
        <ErrorState error={search.error} onRetry={() => runSearch(search.term)} />
      </Card>
    );
  } else {
    results = (
      <>
        {search.status === 'done' && search.results.length > 0 && (
          <p className="mb-2 text-sm text-slate-600">
            {total} {total === 1 ? 'student' : 'students'} found for “{search.term}”.
          </p>
        )}
        <Card padded={false}>
          <Table
            caption="Student search results"
            columns={columns}
            rows={pageItems}
            loading={searching}
            skeletonRows={3}
            emptyState={
              <EmptyState title="No students found" message={`No student matches “${search.term}”.`} />
            }
          />
          <Pagination
            className="border-t border-slate-200 px-4 py-3"
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Students" description="Find a student to start their clearance." />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-64 sm:max-w-md">
            <Input
              label="Student ID or name"
              placeholder="For example BDU00123"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              aria-invalid={termError ? true : undefined}
              aria-describedby={termError ? 'student-search-error' : undefined}
            />
          </div>
          <Button type="submit" loading={searching}>
            Search
          </Button>
        </form>
        {termError && (
          <p id="student-search-error" role="alert" className="mt-2 text-sm text-red-700">
            {termError}
          </p>
        )}
      </Card>

      {results}

      {initiating && (
        <InitiateModal
          student={initiating}
          onClose={() => setInitiating(null)}
          onCreated={handleCreated}
          onStale={() => runSearch(search.term)}
        />
      )}
    </>
  );
}