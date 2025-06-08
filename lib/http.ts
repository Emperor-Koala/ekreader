import axios from 'axios';
import { getItem, getItemAsync } from 'expo-secure-store';
import { DateTime } from 'luxon';
import { SecureStorageKeys } from './secureStorageKeys';

const server = getItem(SecureStorageKeys.server);
if (server) {
    axios.defaults.baseURL = server;
}

axios.defaults.timeout = 10000; // 10 seconds timeout
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0';

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

// axios.interceptors.response.use(async (response) => {

//     if (response.headers['set-cookie']) {
//         // TODO split the cookies out of the string
//         const cookies = response.headers['set-cookie'].length > 1
//             ? response.headers['set-cookie']
//             : response.headers['set-cookie'][0].split(/, (?=KOMGA-SESSION|komga-remember-me)/);
//         const promises = [];
//         for (const cookieStr of cookies) {
//             const [cookie, ...properties] = cookieStr.split(';');
//             const [name, value] = cookie.split('=');

//             if (!value) {
//                 promises.push(deleteItemAsync(name));
//                 continue;
//             }
            
//             if (name === SecureStorageKeys.remember) {
//                 const expiry = properties.find((prop) => prop.startsWith('Expires'));
//                 if (!expiry) {
//                     promises.push(setItemAsync(SecureStorageKeys.remember, value));
//                 } else {
//                     const expires = DateTime.fromHTTP(expiry.split('=')[1]).toMillis();
//                     promises.push(
//                         setItemAsync(
//                             SecureStorageKeys.remember,
//                             `${value};${expires}`
//                         )
//                     )
//                 }
//             }
//         }

//         await Promise.allSettled(promises);
//     }

//     return response;
// });