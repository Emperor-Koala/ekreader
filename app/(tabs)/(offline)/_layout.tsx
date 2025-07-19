import { Stack } from "expo-router";

export default function OfflineTabLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Offline Downloads" }} />
            <Stack.Screen name="book/[fileName]" options={{ title: "", headerBackTitle: "Offline" }} />
        </Stack>
    );
}