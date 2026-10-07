import { useState } from 'react';

import Button from './ui/Button';
import { useToast } from '../hooks/useToast';
import { clearanceService } from '../services/clearanceService';
import { getErrorMessage } from '../utils/errors';
import { saveBlob, showBlobInTab, showTabMessage } from '../utils/files';
import { CLEARANCE_STATUS } from '../utils/status';

export default function CertificateActions({ clearance, size = 'md', showWhenNotReady = false }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null); // 'view', 'download' or null

  if (clearance.status !== CLEARANCE_STATUS.COMPLETED) {
    return showWhenNotReady ? (
      <span className="text-sm text-slate-500">Certificate available after final approval.</span>
    ) : null;
  }

  const studentId = clearance.student?.student_id;
  const filename = `clearance-${clearance.id}${studentId ? `-${studentId}` : ''}.pdf`;

  async function run(action) {
    setBusy(action);

    // Open the tab right now, inside the click. Browsers block tabs that are opened after a delay.
    let tab = null;
    if (action === 'view') {
      tab = window.open('', '_blank');
      if (tab) showTabMessage(tab, 'Preparing your document…');
    }

    try {
      const file = await clearanceService.document(clearance.id);

      if (tab) {
        showBlobInTab(tab, file);
      } else {
        saveBlob(file, filename);
        if (action === 'view') {
          toast.info('Your browser blocked the new tab, so the document was downloaded instead.');
        }
      }
    } catch (error) {
      if (tab) tab.close();
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size={size}
        loading={busy === 'view'}
        disabled={busy === 'download'}
        onClick={() => run('view')}
      >
        View document
      </Button>
      <Button size={size} loading={busy === 'download'} disabled={busy === 'view'} onClick={() => run('download')}>
        Download
      </Button>
    </>
  );
}