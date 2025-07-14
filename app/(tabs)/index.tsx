import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, View } from "react-native";
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
  // TODO implement connectivity check, show offline message if not connected
  // TODO show not loggged in message if not logged in

  const { currentUser } = useAuthContext();
  const keepReading = useKeepReadingList();
  const recentlyAddedBooks = useRecentlyAddedBooksList();
  const recentlyAddedSeries = useRecentlyAddedSeriesList(); // TODO

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

  // TODO: pull to refresh
  return (
    <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
      {currentUser.data ? (
        <ScrollView> 
          <View className="mb-3">
            <Text className="text-2xl mb-2 pt-4 px-4">Keep Reading</Text>
            {
              keepReading.isLoading
              ? <ActivityIndicator />
              : keepReading.isError
              ? (<Text>{keepReading.error.message}</Text>)
              : (
                <FlashList
                  data={keepReadingData}
                  horizontal
                  contentContainerStyle={{paddingHorizontal: 16}}
                  renderItem={({item: book}) => (
                    <View className="w-40 p-2">
                      <BookItem book={book} />
                    </View>
                  )}
                />
              )
            }
          </View>
          {/* Row: Recently Added Books */}
          <View className="mb-3">
            <Text className="text-2xl mb-2 pt-4 px-4">Recently Added Books</Text>
            {
              recentlyAddedBooks.isLoading
              ? <ActivityIndicator />
              : recentlyAddedBooks.isError
              ? (<Text>{recentlyAddedBooks.error.message}</Text>)
              : (
                <FlashList
                  data={recentlyAddedBooksData}
                  horizontal
                  contentContainerStyle={{paddingHorizontal: 16}}
                  renderItem={({item: book}) => (
                    <View className="p-2">
                      <BookItem book={book} />
                    </View>
                  )}
                />
              )
            }
          </View>
          {/* Row: Recently Added Series */}
          <View className="mb-3">
            <Text className="text-2xl mb-2">Recently Added Series</Text>
          </View>
        </ScrollView>
      ) : (
        <></>
      )}
    </SafeAreaView>
  );
}
