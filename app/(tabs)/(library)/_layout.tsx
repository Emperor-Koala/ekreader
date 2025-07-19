import { Stack } from "expo-router";

export default function LibraryTabLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Library" }} />
            <Stack.Screen name="library/[libraryId]" />
            <Stack.Screen name="book/[bookId]" options={{ title: "" }} />
        </Stack>
    )
}