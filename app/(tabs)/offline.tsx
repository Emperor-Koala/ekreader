import { FlashList } from "@shopify/flash-list";
import { ActivityIndicator, SafeAreaView, ScrollView, View } from "react-native";
import { BookItem } from "~/components/BookItem";
import { Text } from "~/components/ui/text";
import { useOfflineBookList } from "~/lib/query/bookLists";

export default function OfflinePage() {
    const { data, isLoading, isError, error } = useOfflineBookList();

    return (
        <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
            <ScrollView className="flex-1">
                <View className="flex-1 items-center justify-center">
                    {
                        isLoading
                        ? <ActivityIndicator />
                        : isError
                        ? (<Text>{error.message}</Text>)
                        : (
                            <FlashList
                                data={data}
                                numColumns={2}
                                style={{ width: "100%", padding: 16 }}
                                renderItem={({item: book}) => (
                                    <View className="p-2">
                                        <BookItem book={book.metadata} thumbnail={book.thumbnail} className="w-full" offline />
                                    </View>
                                )}
                            />
                        )
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}