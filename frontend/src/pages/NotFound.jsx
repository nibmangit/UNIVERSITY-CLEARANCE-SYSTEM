import { useEffect } from 'react';
import Button from '../components/ui/Button';


export default function NotFound({ fullScreen = false }) {
  useEffect(() => {
    document.title = 'Page not found · University Clearance';
  }, []);

  const content = (
    <div className="mx-auto max-w-sm py-16 text-center">
      <p className="text-sm font-medium text-sky-800">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you're looking for doesn't exist or has moved.</p>
      <div className="mt-6">
        <Button to="/">Go to home</Button>
      </div>
    </div>
  );

  if (!fullScreen) return content;

  return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">{content}</div>;
}