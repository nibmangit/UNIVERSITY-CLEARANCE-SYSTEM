import { useState } from 'react';
import Badge from '../components/ui/Badge';
import Breadcrumb from '../components/ui/Breadcrumb';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DetailList from '../components/ui/DetailList';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Skeleton, { SkeletonText } from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import Textarea from '../components/ui/Textarea';
import { CLEARANCE_STATUS, ISSUE_STATUS, OFFICE_STATUS } from '../utils/status';

function SaveDemo() {
  const [saving, setSaving] = useState(false);

  function handleClick() {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }

  return (
    <Button loading={saving} onClick={handleClick}>
      {saving ? 'Saving…' : 'Click to save'}
    </Button>
  );
}

const REASONS = [
  { value: 'missing_equipment', label: 'Missing equipment' },
  { value: 'unpaid_fee', label: 'Unpaid fee' },
  { value: 'other', label: 'Other' },
];

function FormDemo() {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!reason) next.reason = 'Please select a reason.';
    if (!description.trim()) next.description = 'Description cannot be empty.';
    setErrors(next);
    setSent(Object.keys(next).length === 0);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <Select
        label="Reason"
        required
        placeholder="Select reason"
        options={REASONS}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        error={errors.reason}
      />
      <Textarea
        label="Description"
        required
        placeholder="Describe the problem…"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={errors.description}
      />
      <Button type="submit">Report issue</Button>
      {sent && <p className="text-sm text-emerald-700">Form is valid. Nothing was sent.</p>}
    </form>
  );
}

function SearchDemo() {
  const [query, setQuery] = useState('');
  return (
    <SearchInput className="w-full max-w-sm" value={query} onChange={setQuery} placeholder="Student ID or name" />
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

// TEMPORARY page for checking the UI kit. Each step adds a section. Delete it when the pages are built.
export default function UiDemo() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold text-slate-900">UI kit demo</h1>
      <p className="mt-1 text-sm text-slate-600">Temporary page. Delete it when the real pages are built.</p>

      <Section title="StatusBadge: clearance">
        {Object.values(CLEARANCE_STATUS).map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </Section>

      <Section title="StatusBadge: office">
        {Object.values(OFFICE_STATUS).map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </Section>

      <Section title="StatusBadge: issue">
        {Object.values(ISSUE_STATUS).map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </Section>

      <Section title="In context">
        <div className="flex w-full max-w-sm items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm font-medium text-slate-900">Sport Office</span>
          <StatusBadge status="FLAGGED" />
        </div>
      </Section>

      <Section title="Badge: generic tones">
        <Badge tone="slate">Slate</Badge>
        <Badge tone="sky">Sky</Badge>
        <Badge tone="emerald">Emerald</Badge>
        <Badge tone="red">Red</Badge>
        <Badge tone="amber">Amber</Badge>
        <Badge tone="sky" dot={false}>No dot</Badge>
      </Section>

            <Section title="Button: variants">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
      </Section>

      <Section title="Button: sizes">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Section>

      <Section title="Button: states">
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <SaveDemo />
        <Button variant="secondary" disabled>
          Disabled secondary
        </Button>
      </Section>

      <Section title="Button: as a link and full width">
        <Button to="/ui-demo" variant="secondary">
          Link to this page
        </Button>
        <div className="w-full max-w-xs">
          <Button fullWidth>Full width</Button>
        </div>
      </Section>

      <Section title="LoadingSpinner">
        <LoadingSpinner size="sm" className="text-sky-900" />
        <LoadingSpinner size="md" className="text-sky-900" />
        <LoadingSpinner size="lg" className="text-sky-900" />
        <LoadingSpinner label="Loading clearances…" />
      </Section>


            <Section title="Input">
        <div className="w-full max-w-sm space-y-4">
          <Input label="University ID" placeholder="BDU00123" />
          <Input label="Student ID" required hint="As printed on your student card." />
          <Input label="With an error" defaultValue="abc" error="University ID is required." />
          <Input label="Disabled" defaultValue="Not editable" disabled />
        </div>
      </Section>

      <Section title="Select, Textarea and a validated form (press the button with empty fields)">
        <FormDemo />
      </Section>

      <Section title="SearchInput (type something, then use the x)">
        <SearchDemo />
      </Section>


            <Section title="PageHeader (breadcrumbs and actions, then a back link)">
        <div className="w-full rounded-lg border border-dashed border-slate-300 bg-white p-5">
          <PageHeader
            breadcrumbs={[{ label: 'Clearances', to: '/ui-demo' }, { label: 'Clearance #102' }]}
            title="Clearance #102"
            description="Graduation clearance for Abebe Kebede"
            actions={
              <>
                <Button variant="secondary">Print</Button>
                <Button>Final approve</Button>
              </>
            }
          />
          <PageHeader backTo="/ui-demo" backLabel="Back to clearances" title="With a back link" />
        </div>
      </Section>

      <Section title="Breadcrumb on its own">
        <Breadcrumb
          items={[
            { label: 'Registrar', to: '/ui-demo' },
            { label: 'Clearances', to: '/ui-demo' },
            { label: '#102' },
          ]}
        />
      </Section>

      <Section title="StatCard (the last one is loading)">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending" value={12} hint="Waiting for you" />
          <StatCard label="Cleared" value={34} tone="emerald" />
          <StatCard label="Issues" value={3} tone="red" hint="Need attention" />
          <StatCard label="Today" loading />
        </div>
      </Section>

      <Section title="Card and DetailList">
        <Card
          className="w-full max-w-2xl"
          title="Student information"
          description="From the university records"
          actions={
            <Button size="sm" variant="secondary">
              Refresh
            </Button>
          }
        >
          <DetailList
            columns={2}
            items={[
              { label: 'Name', value: 'Abebe Kebede' },
              { label: 'Student ID', value: 'BDU00123' },
              { label: 'Faculty', value: 'Faculty of Computing' },
              { label: 'Department', value: 'Software Engineering' },
              { label: 'Section', value: 'A' },
              { label: 'Year', value: 3 },
              { label: 'Phone', value: '' },
            ]}
          />
        </Card>
        <Card className="w-full max-w-2xl">
          <p className="text-sm text-slate-600">A card without a header.</p>
        </Card>
      </Section>

      <Section title="Skeleton (loading placeholders)">
        <div className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <Skeleton className="h-6 w-1/2" />
          <SkeletonText lines={3} />
        </div>
      </Section>

    </div>
  );
}