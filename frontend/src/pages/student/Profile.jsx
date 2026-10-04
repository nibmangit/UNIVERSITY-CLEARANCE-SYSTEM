import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import DetailList from '../../components/ui/DetailList';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { SkeletonText } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { authService } from '../../services/authService';

export default function StudentProfile() {
  const { data: profile, loading, error, reload } = useApi(authService.profile);

  const header = <PageHeader title="My profile" />;

  if (error) {
    return (
      <>
        {header}
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      </>
    );
  }

  if (loading && !profile) {
    return (
      <>
        {header}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1">
              <SkeletonText lines={2} className="max-w-xs" />
            </div>
          </div>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Personal information">
            <SkeletonText lines={4} />
          </Card>
          <Card title="Academic information">
            <SkeletonText lines={4} />
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {header}

      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile.full_name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{profile.full_name}</p>
            <p className="text-sm text-slate-600">{profile.student_id}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Personal information">
          <DetailList
            columns={1}
            items={[
              { label: 'Full name', value: profile.full_name },
              { label: 'Student ID', value: profile.student_id },
              { label: 'Email', value: profile.email },
              { label: 'Phone', value: profile.phone },
            ]}
          />
        </Card>

        <Card title="Academic information">
          <DetailList
            columns={1}
            items={[
              { label: 'Faculty', value: profile.faculty },
              { label: 'Department', value: profile.department },
              { label: 'Section', value: profile.section },
              { label: 'Year', value: profile.year },
            ]}
          />
        </Card>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        This information comes from the university records and cannot be changed here. If something is
        wrong, contact the registrar's office.
      </p>
    </>
  );
}