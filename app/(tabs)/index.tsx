import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { z } from "zod";
import { useAuthContext } from "~/components/AuthProvider";
import { BookItem } from "~/components/BookItem";
import { Text } from "~/components/ui/text";
import {
  useKeepReadingList,
  useRecentlyAddedBooksList,
} from "~/lib/query/bookLists";
import { useRecentlyAddedSeriesList } from "~/lib/query/seriesLists";
import { Book } from "~/lib/types/Book";

export default function HomeScreen() {
  const { currentUser } = useAuthContext();
  const keepReading = useKeepReadingList();
  const recentlyAddedBooks = useRecentlyAddedBooksList();
  const recentlyAddedSeries = useRecentlyAddedSeriesList();

  const keepReadingData = useMemo(() => {
    const data: z.infer<typeof Book>[] = [];
    if (keepReading.isLoading || keepReading.isError) return data;
    for (const page of keepReading.data!.pages) {
      data.push(...page.content)
    }
    return data;
  }, [keepReading]);

  const recentlyAddedBooksData = useMemo(() => {
    const data: z.infer<typeof Book>[] = [];
    if (recentlyAddedBooks.isLoading || recentlyAddedBooks.isError) return data;
    for (const page of recentlyAddedBooks.data!.pages) {
      data.push(...page.content)
    }
    return data;
  }, [recentlyAddedBooks]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
      {currentUser.data ? (
        <View className="p-5">
          <View className="mb-3">
            <Text className="text-2xl mb-2">Keep Reading</Text>
            {
              keepReading.isLoading
              ? <ActivityIndicator />
              : keepReading.isError
              ? (<Text>{keepReading.error.message}</Text>)
              : (
                <FlashList
                  data={keepReadingData}
                  horizontal
                  renderItem={({item: book}) => (
                    <View className="p-2">
                      <BookItem book={book} />
                    </View>
                  )}
                />
              )
            }
          </View>
          {/* Row: Recently Added Books */}
          <View className="mb-3">
            <Text className="text-2xl mb-2">Recently Added Books</Text>
          </View>
          {/* Row: Recently Added Series */}
          <View className="mb-3">
            <Text className="text-2xl mb-2">Recently Added Series</Text>
          </View>
        </View>
      ) : (
        <></>
      )}
    </SafeAreaView>
  );
}
