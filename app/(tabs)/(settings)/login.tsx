import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { z } from "zod";
import { useAuthContext } from "~/components/AuthProvider";
import { Button } from "~/components/ui/Button";
import { Colors } from "~/constants/Colors";

const validator = z.object({
    server: z.string().url().min(1, "Server URL is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
});

const Login: React.FC = () => {
    const router = useRouter();

    const { currentUser, login } = useAuthContext();

    const [server, setServer] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

//    const [errors, setErrors] = useState<{ server?: string; email?: string; password?: string }>({});
    const errors = useMemo(() => {
        const result = validator.safeParse({ server, email, password });
        if (result.success) {
            return {};
        }
        const errorMap: { server?: string; email?: string; password?: string } = {};
        result.error.errors.forEach((error) => {
            if (error.path.length > 0) {
                const key = error.path[0] as keyof typeof errorMap;
                errorMap[key] = error.message;
            }
        });
        return errorMap;
    }, [server, email, password]);

    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        // If already logged in, redirect back
        if (currentUser.data) {
            router.back();
        }
    }, [currentUser.data, router]);

    const attemptLogin = useCallback(() => {
        Keyboard.dismiss();
        setSubmitError(null);
        if (login.isPending || !server || !email || !password || Object.keys(errors).length > 0) {
            console.warn("Login attempt ignored due to invalid state");
            return;
        }
        login.mutate(
            { server, email, password },
            {
                onSuccess: () => {
                    // TODO: Show success message and redirect
                    console.log("Login successful");
                    router.back();
                },
                onError: (error) => {
                    // Handle login error
                    console.error("Login failed:", error);
                    setSubmitError(error.message || "Login failed. Please try again.");
                },
            }
        );
    }, [server, email, password, login, router, setSubmitError, errors]);

    return (
        <SafeAreaView style={styles.page}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.body}
                >
                    <View style={styles.form}>
                        <View>
                            <TextInput
                                style={styles.input}
                                placeholder="Server"
                                placeholderTextColor="#aaa"
                                autoCapitalize="none"
                                onChangeText={setServer}
                                keyboardType="url"
                            />
                            {errors.server && <Text style={{ color: 'red' }}>{errors.server}</Text>}
                        </View>
                        <View>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#aaa"
                                autoCapitalize="none"
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                            {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}
                        </View>
                        <View>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#aaa"
                                secureTextEntry={true}
                                autoCapitalize="none"
                                onChangeText={setPassword}
                            />
                            {errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}
                        </View>
                        <View>
                            <Button
                                disabled={login.isPending || !server || !email || !password || Object.keys(errors).length > 0}
                                onPress={attemptLogin}
                                activeOpacity={0.7}
                            >
                                {login.isPending ? (<ActivityIndicator size={16} color={Colors.light.primaryFg} />) : "LOGIN"}
                            </Button>
                            {submitError && <Text style={{ color: 'red', marginTop: 8 }}>{submitError}</Text>}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
export default Login;

const styles = StyleSheet.create({
    page: { flex: 1 },
    body: {
        paddingVertical: 24,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    form: {
        width: '75%',
        maxWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    input: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        height: 40,
        paddingInline: 12,
        backgroundColor: 'white',
    },
});