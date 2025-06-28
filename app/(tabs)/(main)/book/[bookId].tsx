import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { Text } from "~/components/ui/text";
import { useBookDetails } from "~/lib/query/bookDetails";

export default function BookDetails() {
    const {bookId} = useLocalSearchParams<{bookId: string}>();
    
    const bookDetails = useBookDetails(bookId);
    return (
        <>
            <Stack.Screen options={{}} />
            <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
                {bookDetails.isLoading ? <ActivityIndicator /> : bookDetails.isError ? <Text>{bookDetails.error.message}</Text> : <Text>{bookDetails.data!.id}</Text>}
            </SafeAreaView>
        </>
    );
}