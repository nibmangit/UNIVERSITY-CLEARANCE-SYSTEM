const KEEP_TAB_URL_MS = 5 * 60 * 1000;

/** Saves a Blob as a file with the given name. */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Shows a Blob in a tab that was opened earlier with window.open('', '_blank'). */
export function showBlobInTab(tab, blob) {
  const url = URL.createObjectURL(blob);
  tab.location.href = url;

  // Kept for a few minutes so the tab can be reloaded, then released.
  setTimeout(() => URL.revokeObjectURL(url), KEEP_TAB_URL_MS);
}

/** Puts a short message in a freshly opened blank tab while the file is still being fetched. */
export function showTabMessage(tab, message) {
  try {
    tab.document.title = message;
    tab.document.body.style.fontFamily = 'system-ui, sans-serif';
    tab.document.body.style.padding = '2rem';
    tab.document.body.textContent = message;
  } catch {
    // If the browser does not allow touching the new tab, it just stays blank until the file arrives.
  }
}