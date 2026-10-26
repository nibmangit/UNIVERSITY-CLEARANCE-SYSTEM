import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ConfirmModal from './ui/ConfirmModal';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

function Layout() {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  function askToLogOut() {
    setMenuOpen(false);
    setConfirmingLogout(true);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={menuOpen} onClose={closeMenu} onLogout={askToLogOut} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMenuOpen(true)} onLogout={askToLogOut} />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <ConfirmModal
        open={confirmingLogout}
        title={t('logoutConfirmTitle', 'Log out?')}
        message={t('logoutConfirmMessage', 'You will need to log in again to continue.')}
        confirmLabel={t('logout', 'Log out')}
        cancelLabel={t('cancel', 'Cancel')}
        onConfirm={logout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}

export default Layout;
