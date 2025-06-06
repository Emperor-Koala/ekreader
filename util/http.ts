import axios from 'axios';
import { deleteItemAsync, getItem, getItemAsync, setItemAsync } from 'expo-secure-store';
import { DateTime } from 'luxon';
import { SecureStorageKeys } from './secureStorageKeys';

const server = getItem(SecureStorageKeys.server);
if (server) {
    axios.defaults.baseURL = server;
}

axios.interceptors.request.use(async (config) => {

    const [session, rememberMe] = await Promise.allSettled([
        getItemAsync(SecureStorageKeys.session),
        getItemAsync(SecureStorageKeys.remember)
    ]);

    let cookie = '';
    if (session.status === 'fulfilled' && session.value) {
        cookie += `${SecureStorageKeys.session}=${session.value}`;
    }
    if (rememberMe.status === 'fulfilled' && rememberMe.value) {
        if (rememberMe.value?.includes(';')) {
            const [value, expiry] = rememberMe.value.split(';');
            if (DateTime.fromMillis(parseInt(expiry)) >= DateTime.now()) {
                cookie += `${SecureStorageKeys.remember}=${value}`;
            }
        } else {
            cookie += `${SecureStorageKeys.remember}=${rememberMe.value}`;
        }
    }

    config.headers.cookie = cookie;

    return config;
});

axios.interceptors.response.use(async (response) => {

    if (response.headers['set-cookie']) {
        const promises = [];
        for (const cookieStr of response.headers['set-cookie']) {
            const [cookie, ...properties] = cookieStr.split(';');
            const [name, value] = cookie.split('=');

            if (!value) {
                promises.push(deleteItemAsync(name));
                continue;
            }
            
            if (name === SecureStorageKeys.remember) {
                const expiry = properties.find((prop) => prop.startsWith('Expires'));
                if (!expiry) {
                    promises.push(setItemAsync(SecureStorageKeys.remember, value));
                } else {
                    const expires = DateTime.fromHTTP(expiry.split('=')[1]).toMillis();
                    promises.push(
                        setItemAsync(
                            SecureStorageKeys.remember,
                            `${value};${expires}`
                        )
                    )
                }
            }
        }

        await Promise.allSettled(promises);
    }

    return response;
});