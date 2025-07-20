import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { BooksGrid } from "~/components/BooksGrid";
import { useSeriesBooks } from "~/lib/query/bookLists";
import { useSeries } from "~/lib/query/seriesLists";

export default function Series() {
    const { seriesId } = useLocalSearchParams<{ seriesId: string }>();
    const series = useSeries(seriesId);
    const { data, isError, error, isLoading } = useSeriesBooks(seriesId);
    const books = useMemo(() => {
        return data?.pages
            .map((page) => page.content)
            .reduce((prev, curr) => [...prev, ...curr])
            .map((book) => ({ metadata: book }));
    }, [data]);

    // TODO infinite scroll

    return (
      <>
        <Stack.Screen options={{ title: series.data?.name ?? "" }} />
            <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator />
                    </View>
                ) : isError ? (
                    <Text className="dark:text-white m-8">{error.message}</Text>
                ) : (
                    <BooksGrid books={books!} />
                )}
            </SafeAreaView>
        </>
    );
}