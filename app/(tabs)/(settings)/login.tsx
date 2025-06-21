import { useRouter } from "expo-router";
import { getItem } from "expo-secure-store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { useAuthContext } from "~/components/AuthProvider";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { SecureStorageKeys } from "~/lib/secureStorageKeys";

const validator = z.object({
  server: z.string().url().min(1, "Server URL is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

const Login: React.FC = () => {
  const router = useRouter();

  const { currentUser, login } = useAuthContext();

  const [server, setServer] = useState<string>(
    getItem(SecureStorageKeys.server) || "",
  );
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
    if (
      login.isPending ||
      !server ||
      !email ||
      !password ||
      Object.keys(errors).length > 0
    ) {
      console.warn("Login attempt ignored due to invalid state");
      return;
    }
    login.mutate(
      { server, email, password },
      {
        onSuccess: () => {
          // TODO: Show success message and redirect
          // console.log("Login successful");
          Toast.show({
            type: "success",
            text1: "Login Successful",
            text2: "You are now logged in.",
            position: "bottom",
            bottomOffset: 90,
          });
          router.back();
        },
        onError: (error) => {
          // Handle login error
          setSubmitError(error.message || "Login failed. Please try again.");
        },
      },
    );
  }, [server, email, password, login, router, setSubmitError, errors]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="py-6 flex flex-1 items-center justify-center bg-background"
      >
        <View className="w-3/4 max-w-xs flex flex-col gap-3">
          <View>
            <Input
              placeholder="Server"
              autoCapitalize="none"
              defaultValue={server}
              onChangeText={setServer}
              keyboardType="url"
              className={errors.server ? "border-destructive" : ""}
            />
            {errors.server && (
              <Text style={{ color: "red" }}>{errors.server}</Text>
            )}
          </View>
          <View>
            <Input
              placeholder="Email"
              autoCapitalize="none"
              onChangeText={setEmail}
              keyboardType="email-address"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <Text style={{ color: "red" }}>{errors.email}</Text>
            )}
          </View>
          <View>
            <Input
              placeholder="Password"
              secureTextEntry={true}
              autoCapitalize="none"
              onChangeText={setPassword}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <Text style={{ color: "red" }}>{errors.password}</Text>
            )}
          </View>
          <View>
            <Button
              disabled={
                login.isPending ||
                !server ||
                !email ||
                !password ||
                Object.keys(errors).length > 0
              }
              onPress={attemptLogin}
              variant="secondary"
            >
              <Text>LOGIN</Text>
            </Button>
            {submitError && (
              <Text style={{ color: "red", marginTop: 8 }}>{submitError}</Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
export default Login;
