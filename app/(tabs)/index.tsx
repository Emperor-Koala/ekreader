import { useNetInfo } from '@react-native-community/netinfo';
import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, View } from "react-native";
import { z } from "zod";
import { useAuthContext } from "~/components/AuthProvider";
import { BookItem } from "~/components/BookItem";
import { Text } from "~/components/ui/text";
import { CloudOff } from '~/lib/icons/CloudOff';
import { UserLock } from '~/lib/icons/UserLock';
import {
  useKeepReadingList,
  useRecentlyAddedBooksList,
} from "~/lib/query/bookLists";
import { useRecentlyAddedSeriesList } from "~/lib/query/seriesLists";
import { Book } from "~/lib/types/Book";

export default function HomeScreen() {
  const { isConnected } = useNetInfo();

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
      { 
        isConnected === null
        ? (<></>)
        : !isConnected
        ? (
          <View className="flex items-center justify-center flex-1">
            <CloudOff className="stroke-neutral-500 dark:stroke-neutral-200" size={48} />
            <Text className="text-2xl">{"You're offline!"}</Text>
            <Text className="text-center w-1/2 mt-4 text-lg">Feel free to read any books you previously downloaded in the Offline tab!</Text>
          </View>
        )
        : currentUser.isLoading 
        ? (
          <View className="flex items-center justify-center flex-1">
            <ActivityIndicator />
          </View>
        )
        : currentUser.isError || !currentUser.data 
        ? (
          <View className="flex items-center justify-center flex-1">
            <UserLock className="stroke-neutral-500 dark:stroke-neutral-200" size={48} />
            <Text className="text-2xl">{"You're not logged in!"}</Text>
            <Text className="text-center w-1/2 mt-4 text-lg">Head over to the Settings tab to login to your Kokmga server!</Text>
          </View>
        )
        : (
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
        )
      }
    </SafeAreaView>
  );
}
