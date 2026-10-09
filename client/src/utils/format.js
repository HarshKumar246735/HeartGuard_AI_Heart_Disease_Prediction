export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const formatPercent = (p) => `${Math.round(p * 100)}%`;

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ERR_NETWORK') return 'Unable to reach the server. Check your connection and try again.';
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  return fallback;
};

/** Converts server validation `errors` array into { field: message }. */
export const getFieldErrors = (err) =>
  (err?.response?.data?.errors || []).reduce((acc, e) => ({ ...acc, [e.field]: e.message }), {});
