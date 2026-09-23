export const setCookie = (
  name: string,
  value: string,
  days: number = 7
) => {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setTime(
    expires.getTime() + days * 24 * 60 * 60 * 1000
  );

  document.cookie = `${name}=${encodeURIComponent(
    value
  )};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");

  const cookie = cookies.find((row) =>
    row.startsWith(`${name}=`)
  );

  if (!cookie) return null;

  return decodeURIComponent(
    cookie.substring(name.length + 1)
  );
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const setAppKey = (appKey: string) => {
  setCookie("appKey", appKey);
};

export const getAppKey = () => {
  return getCookie("appKey");
};

export const removeAppKey = () => {
  deleteCookie("appKey");
};