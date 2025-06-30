import axios from "axios";
import {
  deleteItemAsync,
  getItem,
  getItemAsync,
  setItem,
} from "expo-secure-store";
import { DateTime } from "luxon";
import { SecureStorageKeys } from "./secureStorageKeys";

const server = getItem(SecureStorageKeys.server);
if (server) {
  axios.defaults.baseURL = server;
}

axios.defaults.timeout = 4000; // 4 seconds timeout
// axios.defaults.headers.common['User-Agent'] = 'axios/1.9.0';

axios.interceptors.request.use(async (config) => {
  const [session, rememberMe] = await Promise.allSettled([
    getItemAsync(SecureStorageKeys.session),
    getItemAsync(SecureStorageKeys.remember),
  ]);

  let cookie = [];
  if (session.status === "fulfilled" && session.value) {
    cookie.push(`${SecureStorageKeys.session}=${session.value}`);
  }
  if (rememberMe.status === "fulfilled" && rememberMe.value) {
    if (rememberMe.value?.includes(";")) {
      const [value, expiry] = rememberMe.value.split(";");
      if (DateTime.fromMillis(parseInt(expiry)) >= DateTime.now()) {
        cookie.push(`${SecureStorageKeys.remember}=${value}`);
      }
    } else {
      cookie.push(`${SecureStorageKeys.remember}=${rememberMe.value}`);
    }
  }

  config.headers.cookie = cookie.join(';');

  return config;
});

axios.interceptors.response.use(async (response) => {
  if (response.headers["set-cookie"]) {
    const cookies =
      response.headers["set-cookie"].length > 1
        ? response.headers["set-cookie"]
        : response.headers["set-cookie"][0].split(
            /, (?=KOMGA-SESSION|komga-remember-me)/,
          );
    for (const cookieStr of cookies) {
      const [cookie, ...properties] = cookieStr.split(";").map((s) => s.trim());
      const [name, value] = cookie.split("=");

      if (!value) {
        await deleteItemAsync(name);
        continue;
      }

      setItem(name, value);

      if (name === SecureStorageKeys.remember) {
        const expiry = properties.find((prop) => prop.startsWith("Expires"));
        if (expiry) {
          const expires = DateTime.fromHTTP(expiry.split("=")[1]).toMillis();
          setItem(SecureStorageKeys.remember, `${value};${expires}`);
        }
      }
    }
  }

  return response;
});
