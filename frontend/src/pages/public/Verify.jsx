import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DetailList from '../../components/ui/DetailList';
import ErrorState from '../../components/ui/ErrorState';
import Input from '../../components/ui/Input';
import { SkeletonText } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { clearanceService } from '../../services/clearanceService';

/** "k7m29qxp4twd" becomes "K7M2-9QXP-4TWD". Anything that is not a letter or digit is dropped. */
function formatCode(value) {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
  return cleaned.match(/.{1,4}/g)?.join('-') ?? '';
}

function CodeForm({ initial = '', onSubmit }) {
  const [code, setCode] = useState(formatCode(initial));
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (code.replace(/-/g, '').length !== 12) {
      setError('Enter all 12 characters of the code.');
      return;
    }

    setError('');
    onSubmit(code);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Verification code"
        hint="Printed under the QR code on the certificate."
        placeholder="XXXX-XXXX-XXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={code}
        error={error}
        className="font-mono tracking-wider"
        onChange={(event) => setCode(formatCode(event.target.value))}
      />
      <Button type="submit" fullWidth>
        Verify certificate
      </Button>
    </form>
  );
}

function StatusIcon({ valid }) {
  return (
    <span
      className={`flex h-14 w-14 items-center justify-center rounded-full ${
        valid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        {valid ? (
          <path d="M8 12.5l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
        )}
      </svg>
    </span>
  );
}

function Result({ code, onCheckAnother, onCheckCode }) {
  const fetcher = useCallback((options) => clearanceService.verifyCertificate(code, options), [code]);
  const { data, loading, error, reload } = useApi(fetcher);

  if (loading && !data) {
    return (
      <Card>
        <p className="mb-4 text-sm text-slate-600" role="status">
          Checking the certificate…
        </p>
        <SkeletonText lines={4} />
      </Card>
    );
  }

  if (error?.status === 404) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center" role="status">
          <StatusIcon valid={false} />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Certificate not found</h1>
          <p className="mt-2 font-mono text-sm text-slate-700">{code}</p>
          <p className="mt-3 text-sm text-slate-600">
            No certificate matches this code. Check it for typing mistakes: the code uses letters and
            numbers, and never the characters 0, O, 1, I or L. If it still fails, ask the student for a
            new copy of the certificate.
          </p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <CodeForm initial={code} onSubmit={onCheckCode} />
        </div>
      </Card>
    );
  }

  if (error?.status === 429) {
    return (
      <Card>
        <ErrorState
          title="Too many checks"
          message="Please wait a minute and try again."
          onRetry={reload}
        />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorState error={error} onRetry={reload} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col items-center text-center" role="status">
        <StatusIcon valid />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Valid certificate</h1>
        <p className="mt-1 text-sm text-slate-600">Issued by {data.university_name}.</p>
      </div>

      <DetailList
        className="mt-6"
        columns={1}
        items={[
          { label: 'Student', value: data.student_name },
          { label: 'Clearance', value: data.clearance_type },
          { label: 'Completed on', value: data.completed_on },
          { label: 'Certificate number', value: data.certificate_number },
          { label: 'Verification code', value: <span className="font-mono">{code}</span> },
        ]}
      />

      <p className="mt-6 text-xs text-slate-500">
        Only these details are shown, to protect the student's privacy.
      </p>

      <div className="mt-4">
        <Button variant="secondary" fullWidth onClick={onCheckAnother}>
          Check another certificate
        </Button>
      </div>
    </Card>
  );
}

export default function Verify() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Verify a certificate · University Clearance';
  }, []);

  function checkCode(value) {
    navigate(`/verify/${value}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <p className="mb-6 text-center text-sm font-medium text-slate-600">University Clearance System</p>

        {code ? (
          // `key` restarts the check when the code in the address changes.
          <Result key={code} code={code} onCheckAnother={() => navigate('/verify')} onCheckCode={checkCode} />
        ) : (
          <Card>
            <h1 className="text-xl font-semibold text-slate-900">Verify a certificate</h1>
            <p className="mt-1 mb-6 text-sm text-slate-600">
              Enter the code printed on a clearance certificate, or scan its QR code, to confirm that the
              university issued it.
            </p>
            <CodeForm onSubmit={checkCode} />
          </Card>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Student or university staff?{' '}
          <Link to="/login" className="font-medium text-sky-800 underline hover:text-sky-900">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}