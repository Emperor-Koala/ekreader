// import { useAuthContext } from '~/components/AuthProvider';

// interface LoginData {
//     server: string;
//     username: string;
//     password: string;
//     rememberMe?: boolean;
// }

// const useLoginService = () => {
//     const { server, setServer, sessionCookie, setSessionCookie, rememberMeCookie, setRememberMeCookie } = useAuthContext();

//     // const login = useMutation({
//     //     mutationKey: ['login'],
//     //     mutationFn: async ({server, username, password, rememberMe}: LoginData) => {
//     //         const response = await fetch(`${server}/api/v2/users/me`, {
//     //             method: 'POST',
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //             },
//     //             body: JSON.stringify({rememberMe}),
//     //         });

//     //         if (!response.ok) {
//     //             throw new Error('Login failed');
//     //         }

//     //         // TODO
//     //         // const result = await response.json();
//     //         // setSessionCookie(result.sessionCookie);
//     //         // if (data.rememberMe) {
//     //         //     setRememberMeCookie(result.rememberMeCookie);
//     //         // }
//     //         // return result;
//     //     },
//     //     onSuccess: (response) => {},
//     // });
// };