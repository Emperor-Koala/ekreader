import { Stack } from "expo-router";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Settings", headerShown: false }}
      />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="appearance" options={{ title: "Appearance" }} />
    </Stack>
  );
};

export default SettingsLayout;
