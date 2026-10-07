/** "k7m29qxp4twd" becomes "K7M2-9QXP-4TWD". Anything that is not a letter or digit is dropped. */
export function formatCode(value) {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
  return cleaned.match(/.{1,4}/g)?.join('-') ?? '';
}

/** True when the text has all 12 characters of a code. */
export function isCompleteCode(value) {
  return value.replace(/-/g, '').length === 12;
}