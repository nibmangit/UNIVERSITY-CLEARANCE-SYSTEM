import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../utils/errors';

const SLIP_OFFICES = [
  { name: 'Advisor', cleared: true },
  { name: 'Library', cleared: true },
  { name: 'Dormitory', cleared: true },
  { name: 'Sport office', cleared: false },
  { name: 'Café', cleared: false },
  { name: 'Faculty store', cleared: false },
];

function Mark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor" opacity="0.14" />
      <path
        d="M9.5 16.5l4.5 4.5 8.5-9.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ off }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" strokeLinecap="round" />}
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ClearanceSlip() {
  const clearedCount = SLIP_OFFICES.filter((office) => office.cleared).length;

  return (
    <div className="w-full max-w-sm -rotate-1 rounded-sm bg-white p-6 text-slate-800 shadow-xl">
      <div className="flex items-baseline justify-between border-b-2 border-slate-800 pb-3">
        <p className="font-serif text-lg font-semibold">Clearance slip</p>
        <p className="text-xs text-slate-500">Graduation</p>
      </div>

      <ul className="mt-4 space-y-3">
        {SLIP_OFFICES.map((office) => (
          <li key={office.name} className="flex items-end gap-2 text-sm">
            <span className="shrink-0">{office.name}</span>
            <span className="mb-1 min-w-4 flex-1 border-b border-dotted border-slate-400" aria-hidden="true" />
            {office.cleared ? (
              <span className="flex shrink-0 items-center gap-1 font-medium text-emerald-700">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Cleared
              </span>
            ) : (
              <span className="shrink-0 text-slate-400">Waiting</span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-5 inline-block -rotate-2 rounded-sm border-2 border-emerald-700 px-2.5 py-1 font-serif text-sm font-semibold text-emerald-700">
        {clearedCount} of {SLIP_OFFICES.length} offices cleared
      </p>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();

  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = {};
    if (!universityId.trim()) errors.universityId = 'University ID is required.';
    if (!password) errors.password = 'Password is required.';

    setFieldErrors(errors);
    setSubmitError('');
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      // On success the auth state changes and the app moves the user on (wired up in step 6).
      await login({ universityId: universityId.trim(), password });
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
      setSubmitting(false);
    }
  }

  const inputClasses = (hasError) =>
    `mt-1.5 block h-11 w-full rounded-md border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-offset-1 sm:text-sm ${
      hasError
        ? 'border-red-600 focus:outline-red-600'
        : 'border-slate-300 focus:border-sky-800 focus:outline-sky-800'
    }`;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (large screens only) */}
      <aside className="hidden flex-col justify-between bg-sky-950 p-12 text-sky-50 lg:flex">
        <div className="flex items-center gap-3">
          <Mark className="h-9 w-9 text-sky-200" />
          <span className="text-base font-medium">University Clearance System</span>
        </div>

        <div className="flex flex-col items-start gap-10">
          <div className="max-w-md">
            <h2 className="font-serif text-4xl leading-tight font-semibold text-balance">
              See where your clearance stands.
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-sky-200">
              Each office records its decision here. Students see what is cleared, what is flagged,
              and what is left.
            </p>
          </div>
          <ClearanceSlip />
        </div>

        <p className="text-sm text-sky-300">Accounts come from the university. There is no sign-up.</p>
      </aside>

      {/* Form */}
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:min-h-0 lg:bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Mark className="h-9 w-9 text-sky-900" />
            <span className="text-base font-medium text-slate-900">University Clearance System</span>
          </div>

          <h1 className="font-serif text-3xl font-semibold text-slate-900">Log in</h1>
          <p className="mt-2 text-sm text-slate-600">Use your university ID and password.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="university_id" className="block text-sm font-medium text-slate-800">
                University ID
              </label>
              <input
                id="university_id"
                name="university_id"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={universityId}
                onChange={(event) => setUniversityId(event.target.value)}
                aria-invalid={Boolean(fieldErrors.universityId)}
                aria-describedby={fieldErrors.universityId ? 'university_id_error' : undefined}
                className={inputClasses(fieldErrors.universityId)}
              />
              {fieldErrors.universityId && (
                <p id="university_id_error" className="mt-1.5 text-sm text-red-700">
                  {fieldErrors.universityId}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password_error' : undefined}
                  className={`${inputClasses(fieldErrors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute top-1.5 right-1 flex h-8 w-9 items-center justify-center rounded text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-sky-800"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password_error" className="mt-1.5 text-sm text-red-700">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {submitError && (
              <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-900 text-sm font-medium text-white hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && <Spinner />}
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-500">
            Can't log in? Contact the registrar's office to check your account.
          </p>
        </div>
      </main>
    </div>
  );
}