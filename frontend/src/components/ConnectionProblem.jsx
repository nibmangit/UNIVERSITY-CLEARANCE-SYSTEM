export default function ConnectionProblem({ onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div role="alert" className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Can't reach the server</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your session is saved. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-sky-900 px-4 text-sm font-medium text-white hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}