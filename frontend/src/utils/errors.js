export class ApiError extends Error {
  constructor({ message, status = 0, data = null, fieldErrors = {} }) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 means the server could not be reached
    this.data = data;
    this.fieldErrors = fieldErrors;
  }
}

const DEFAULT_MESSAGES = {
  400: 'The request could not be processed.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to do that.",
  404: 'We could not find what you were looking for.',
};

const SERVER_MESSAGE = 'Something went wrong on our side. Please try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';
export const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";

function humanize(key) {
  const text = key.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toText(value) {
  if (Array.isArray(value)) return value.map(toText).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(toText).join(' ');
  return String(value);
}

const NON_FIELD_KEYS = new Set(['detail', 'code', 'messages', 'non_field_errors']);

export function parseApiError(data, status) {
  const fieldErrors = {};
  let message = '';

  if (Array.isArray(data)) {
    message = toText(data);
  } else if (data && typeof data === 'object') {
    if (typeof data.detail === 'string') message = data.detail;

    if (data.non_field_errors) {
      message = [message, toText(data.non_field_errors)].filter(Boolean).join(' ');
    }

    for (const [key, value] of Object.entries(data)) {
      if (!NON_FIELD_KEYS.has(key)) fieldErrors[key] = toText(value);
    }

    if (!message) {
      const first = Object.entries(fieldErrors)[0];
      if (first) message = `${humanize(first[0])}: ${first[1]}`;
    }
  }

  if (status === 401) message = DEFAULT_MESSAGES[401];

  if (!message) {
    message = status >= 500 ? SERVER_MESSAGE : DEFAULT_MESSAGES[status] || GENERIC_MESSAGE;
  }

  return { message, fieldErrors };
}

export function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return GENERIC_MESSAGE;
}