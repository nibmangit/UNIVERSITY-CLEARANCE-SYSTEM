import { useState } from 'react';

import Avatar from '../../components/ui/Avatar';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DetailList from '../../components/ui/DetailList';
import ErrorState from '../../components/ui/ErrorState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/errors';

function ChangePasswordModal({ open, onClose }) {
  const toast = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!oldPassword) {
      setFieldErrors({ old_password: 'Enter your current password.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setFieldErrors({ new_password: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirm_password: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully.');
      onClose();
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change password"
      description="Enter your current password and pick a new one."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        <Input
          type="password"
          label="Current password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          error={fieldErrors.old_password}
          required
          autoComplete="current-password"
        />

        <Input
          type="password"
          label="New password"
          hint="At least 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={fieldErrors.new_password}
          required
          autoComplete="new-password"
        />

        <Input
          type="password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirm_password}
          required
          autoComplete="new-password"
        />

        <div className="flex justify-end gap-3 pt-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save new password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function StudentProfile() {
  const { data: profile, loading, error, reload } = useApi(authService.profile);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const header = (
    <PageHeader
      title="My profile"
      actions={
        <Button variant="secondary" onClick={() => setChangePasswordOpen(true)}>
          Change password
        </Button>
      }
    />
  );

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

      {changePasswordOpen && (
        <ChangePasswordModal
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />
      )}
    </>
  );
}
