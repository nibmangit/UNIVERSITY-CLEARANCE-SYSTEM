import { useMemo, useState } from 'react';
import Modal from '../../components/ui/Modal';
import SearchInput from '../../components/ui/SearchInput';
import { DEV_ACCOUNTS, DEV_PASSWORD } from './devAccounts';

const GROUPS = ['Registrar', 'Officers', 'Admin', 'Students'];

/** Development only. Calls onSelect({ universityId, password }) when an account is clicked. */
export default function DevAccountPicker({ onClose, onSelect }) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return DEV_ACCOUNTS;

    return DEV_ACCOUNTS.filter((account) =>
      [account.id, account.name, account.detail, account.group].join(' ').toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <Modal
      open
      title="Choose a test account"
      description="Development only. This fills the login form. It does not log you in."
      onClose={onClose}
    >
      <SearchInput value={query} onChange={setQuery} label="Search accounts" placeholder="Name, ID or office" />

      {visible.length === 0 && <p className="mt-4 text-sm text-slate-600">No account matches “{query}”.</p>}

      {GROUPS.map((group) => {
        const accounts = visible.filter((account) => account.group === group);
        if (accounts.length === 0) return null;

        return (
          <section key={group} className="mt-4">
            <h3 className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">{group}</h3>
            <ul>
              {accounts.map((account) => (
                <li key={account.id}>
                  <button
                    type="button"
                    onClick={() => onSelect({ universityId: account.id, password: DEV_PASSWORD })}
                    className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-sky-800"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">{account.name}</span>
                      <span className="block truncate text-xs text-slate-500">{account.detail}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-slate-600">{account.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Modal>
  );
}