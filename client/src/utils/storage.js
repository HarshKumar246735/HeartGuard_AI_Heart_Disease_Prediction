const KEY = 'heartguard_token';

export const getToken = () => localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
export const setToken = (token, remember = true) => {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(KEY, token);
};
export const clearToken = () => {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
};
