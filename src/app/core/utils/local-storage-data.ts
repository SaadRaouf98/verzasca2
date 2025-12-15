import { environment } from '@env/environment';

/**
 * List of local storage keys
 */
export enum LocalStorageKeys {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  USER_ID = 'USER_ID',
  USER_PERMISSIONS = 'USER_PERMISSIONS',
  PHONE_NUMBER = 'PHONE_NUMBER',
}

const prefix = '@WebApp:';
const prodEnv = environment.production;
const secretKey = 'a-quick-brown-fox-jumps-over-the-lazy-dog';

export const GetPhoneNumber = () =>
  getDataFromLocalStorage(LocalStorageKeys.PHONE_NUMBER);
export const setPhoneNumber = (token: string) =>
  saveDataToLocalStorage(LocalStorageKeys.PHONE_NUMBER, token);

export const GetToken = () =>
  getDataFromLocalStorage(LocalStorageKeys.ACCESS_TOKEN);
export const SetToken = (token: string) =>
  saveDataToLocalStorage(LocalStorageKeys.ACCESS_TOKEN, token);

export const GetRefreshToken = () =>
  getDataFromLocalStorage(LocalStorageKeys.REFRESH_TOKEN);
export const SetRefreshToken = (token: string) =>
  saveDataToLocalStorage(LocalStorageKeys.REFRESH_TOKEN, token);

export const GetUserId = () =>
  getDataFromLocalStorage(LocalStorageKeys.USER_ID);

export const SetUserId = (user_id: string) =>
  saveDataToLocalStorage(LocalStorageKeys.USER_ID, user_id);

export const GetUserPermissions = () =>
  getDataFromLocalStorage(LocalStorageKeys.USER_PERMISSIONS);

export const SetUserPermissions = (permissions: string[]) =>
  saveDataToLocalStorage(LocalStorageKeys.USER_PERMISSIONS, permissions);

export const ClearStorage = () => {};

export const RemoveAuthData = () => {
  for (const key in LocalStorageKeys) {
    removeDataFromLocalStorage(key);
  }
};

const xorWithSecretKey = (text: string, secret: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ secret.charCodeAt(i % secret.length)
    );
  }
  return result;
};

const saveDataToLocalStorage = (key: any, value: any) => {
  if (prodEnv) {
    key = btoa(prefix + key.toString()); // Encode key as base64
    key = xorWithSecretKey(key, secretKey); // XOR the key with the secret key
    value = btoa(JSON.stringify(value)); // Encode value as base64
    value = xorWithSecretKey(value, secretKey); // XOR the value with the secret key
  }
  localStorage.setItem(key, JSON.stringify(value));
};

const getDataFromLocalStorage = (key: any) => {
  if (prodEnv) {
    key = btoa(prefix + key.toString()); // Encode key as base64
    key = xorWithSecretKey(key, secretKey); // XOR the key with the secret key
    const data = localStorage.getItem(key);
    const decodedValue = xorWithSecretKey(data!, secretKey); // XOR the value with the secret key
    return JSON.parse(atob(decodedValue)); // Decode base64 value
  }
  const data = localStorage.getItem(key);
  return JSON.parse(data!);
};

const removeDataFromLocalStorage = (key: any) => {
  if (prodEnv) {
    key = btoa(prefix + key.toString()); // Encode key as base64
    key = xorWithSecretKey(key, secretKey); // XOR the key with the secret key
  }
  localStorage.removeItem(key);
};
