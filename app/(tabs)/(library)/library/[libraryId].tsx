import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { BooksGrid } from "~/components/BooksGrid";
import { useLibraryBooks } from "~/lib/query/bookLists";
import { useLibrary } from "~/lib/query/librariesList";

export default function Library() {
  const { libraryId } = useLocalSearchParams<{ libraryId: string }>();
  const library = useLibrary(libraryId);
  const { data, isError, error, isLoading } = useLibraryBooks(libraryId);
  const books = useMemo(() => {
    return data?.pages
      .map((page) => page.content)
      .reduce((prev, curr) => [...prev, ...curr])
      .map((book) => ({ metadata: book }));
  }, [data]);

  return (
    <>
      <Stack.Screen options={{ title: library.data?.name ?? "" }} />
      <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900 pb-16">
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
