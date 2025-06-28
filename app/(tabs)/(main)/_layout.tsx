import { Stack } from "expo-router";

export default function MainTabLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{title: "Home"}} />
            <Stack.Screen name="book/[bookId]" options={{title: ""}} />
        </Stack>
    );
};