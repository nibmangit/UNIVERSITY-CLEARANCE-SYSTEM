import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import Input from './ui/Input';
import { formatCode, isCompleteCode } from '../utils/certificateCode';

// The panel is only mounted while open, so the box is empty every time it opens.
function VerifyPanel({ close }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!isCompleteCode(code)) {
      setError('Enter all 12 characters of the code.');
      return;
    }

    close();
    navigate(`/verify/${code}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Verify a certificate</p>
        <p className="mt-0.5 text-sm text-slate-600">Enter the code printed under the QR code.</p>
      </div>

      <Input
        label="Verification code"
        placeholder="XXXX-XXXX-XXXX"
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={code}
        error={error}
        className="font-mono tracking-wider"
        onChange={(event) => setCode(formatCode(event.target.value))}
      />

      <Button type="submit" fullWidth>
        Verify
      </Button>
    </form>
  );
}

export default function VerifyMenu() {
  return (
    <Dropdown
      label="Verify a certificate"
      title="Verify a certificate"
      buttonClassName="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      panelClassName="w-80 max-w-[calc(100vw-2rem)]"
      trigger={
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
    >
      {({ close }) => <VerifyPanel close={close} />}
    </Dropdown>
  );
}