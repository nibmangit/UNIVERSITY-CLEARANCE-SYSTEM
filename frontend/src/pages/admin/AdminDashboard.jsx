import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

const ADMIN_URL =
  import.meta.env.VITE_ADMIN_URL ||
  new URL('/admin/', new URL(import.meta.env.VITE_API_BASE_URL || '/api', window.location.origin)).href;

export default function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Administration"
        description="Manage the university data behind the clearance system."
      />

      <Card
        title="Django admin"
        description="Users, faculties, departments, sections, offices, officer assignments and clearance types are managed here."
        actions={
          <Button href={ADMIN_URL} target="_blank" rel="noreferrer">
            Open Django admin
          </Button>
        }
      >
        <p className="text-sm text-slate-600">
          This app has no screens of its own for administration. Everything the clearance process needs
          to exist before it starts is set up in the Django admin.
        </p>
      </Card>

      <Card className="mt-6" title="How officers get their students">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Every clearance needs an active <strong>office assignment</strong> for each of the six
            offices. If one is missing, the registrar cannot initiate the clearance.
          </li>
          <li>
            <strong>Advisor</strong> is assigned per faculty, department and section.
          </li>
          <li>
            <strong>Faculty Store</strong> is assigned per faculty.
          </li>
          <li>
            <strong>Library, Dormitory, Sport Office and Café</strong> have one officer for the whole
            university.
          </li>
        </ul>
      </Card>
    </>
  );
}