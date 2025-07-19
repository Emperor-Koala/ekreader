import { useNetInfo } from "@react-native-community/netinfo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import {
  GestureHandlerRootView,
  RefreshControl,
} from "react-native-gesture-handler";
import { useAuthContext } from "~/components/AuthProvider";
import { BookItem } from "~/components/BookItem";
import { SeriesItem } from "~/components/SeriesItem";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { ChevronRight } from "~/lib/icons/ChevronRight";
import { CloudOff } from "~/lib/icons/CloudOff";
import { UserLock } from "~/lib/icons/UserLock";
import {
  useKeepReadingList,
  useRecentlyAddedBooksList,
} from "~/lib/query/bookLists";
import { useLibraries } from "~/lib/query/librariesList";
import { useRecentlyAddedSeriesList } from "~/lib/query/seriesLists";

export default function HomeScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const { isConnected } = useNetInfo();

  const { currentUser } = useAuthContext();
  const keepReading = useKeepReadingList();
  const recentlyAddedBooks = useRecentlyAddedBooksList();
  const recentlyAddedSeries = useRecentlyAddedSeriesList();

  const libraries = useLibraries();

  const keepReadingData = useMemo(() => {
    if (keepReading.isLoading || keepReading.isError) return [];
    return keepReading
      .data!.pages.map((page) => page.content)
      .reduce((prev, curr) => [...prev, ...curr]);
  }, [keepReading]);

  const recentlyAddedBooksData = useMemo(() => {
    if (recentlyAddedBooks.isLoading || recentlyAddedBooks.isError) return [];
    return recentlyAddedBooks
      .data!.pages.map((page) => page.content)
      .reduce((prev, curr) => [...prev, ...curr]);
  }, [recentlyAddedBooks]);

  const recentlyAddedSeriesData = useMemo(() => {
    if (recentlyAddedSeries.isLoading || recentlyAddedSeries.isError) return [];
    return recentlyAddedSeries
      .data!.pages.map((page) => page.content)
      .reduce((prev, curr) => [...prev, ...curr]);
  }, [recentlyAddedSeries]);

  const onRefresh = useCallback(async () => {
    await queryClient.resetQueries({ queryKey: ["home"] });
    keepReading.refetch();
    recentlyAddedBooks.refetch();
    recentlyAddedSeries.refetch();
  }, [queryClient, keepReading, recentlyAddedBooks, recentlyAddedSeries]);

  return (
    <View className="flex-1 bg-neutral-200 dark:bg-neutral-900" style={{paddingBottom}}>
      {isConnected === null ? (
        <></>
      ) : !isConnected ? (
        <View className="flex items-center justify-center flex-1">
          <CloudOff
            className="stroke-neutral-500 dark:stroke-neutral-200"
            size={48}
          />
          <Text className="text-2xl">{"You're offline!"}</Text>
          <Text className="text-center w-1/2 mt-4 text-lg">
            Feel free to read any books you previously downloaded in the Offline
            tab!
          </Text>
        </View>
      ) : currentUser.isLoading ? (
        <View className="flex items-center justify-center flex-1">
          <ActivityIndicator />
        </View>
      ) : currentUser.isError || !currentUser.data ? (
        <View className="flex items-center justify-center flex-1">
          <UserLock
            className="stroke-neutral-500 dark:stroke-neutral-200"
            size={48}
          />
          <Text className="text-2xl">{"You're not logged in!"}</Text>
          <Text className="text-center w-1/2 mt-4 text-lg">
            Head over to the Settings tab to login to your Kokmga server!
          </Text>
        </View>
      ) : (
        <GestureHandlerRootView>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={onRefresh} />
            }
          >
            <View className="mb-3">
              <Text className="text-2xl mb-2 pt-4 px-4">Keep Reading</Text>
              {keepReading.isLoading ? (
                <ActivityIndicator />
              ) : keepReading.isError ? (
                <Text className="px-6">{keepReading.error.message}</Text>
              ) : (
                <FlashList
                  data={keepReadingData}
                  horizontal
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  renderItem={({ item: book }) => (
                    <View className="w-40 p-2">
                      <BookItem book={book} />
                    </View>
                  )}
                />
              )}
            </View>
            {/* Row: Recently Added Books */}
            <View className="mb-3">
              <Text className="text-2xl mb-2 pt-4 px-4">
                Recently Added Books
              </Text>
              {recentlyAddedBooks.isLoading ? (
                <ActivityIndicator />
              ) : recentlyAddedBooks.isError ? (
                <Text className="px-6">{recentlyAddedBooks.error.message}</Text>
              ) : (
                <FlashList
                  data={recentlyAddedBooksData}
                  horizontal
                  onEndReached={recentlyAddedBooks.fetchNextPage}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  renderItem={({ item: book }) => (
                    <View className="p-2">
                      <BookItem book={book} />
                    </View>
                  )}
                />
              )}
            </View>
            {/* Row: Recently Added Series */}
            <View className="mb-3">
              <Text className="text-2xl mb-2 pt-4 px-4">
                Recently Added Series
              </Text>
              {recentlyAddedSeries.isLoading ? (
                <ActivityIndicator />
              ) : recentlyAddedSeries.isError ? (
                <Text className="px-6">
                  {recentlyAddedSeries.error.message}
                </Text>
              ) : (
                <FlashList
                  data={recentlyAddedSeriesData}
                  horizontal
                  onEndReached={recentlyAddedSeries.fetchNextPage}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  renderItem={({ item: series }) => (
                    <View className="p-2">
                      <SeriesItem series={series} />
                    </View>
                  )}
                />
              )}
            </View>
            <View className="mb-8 px-4 gap-y-2">
              <Text className="text-2xl mb-2 pt-4">Browse</Text>
              {libraries.isLoading ? (
                <ActivityIndicator />
              ) : libraries.isError ? (
                <Text className="px-6">{libraries.error.message}</Text>
              ) : (
                libraries.data!.map((lib) => (
                  <Link
                    href={`./library/${lib.id}`}
                    key={`./library/${lib.id}`}
                    asChild
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className="flex-row justify-between"
                    >
                      <Text>{lib.name}</Text>
                      <ChevronRight className="dark:stroke-white" />
                    </Button>
                  </Link>
                ))
              )}
            </View>
          </ScrollView>
        </GestureHandlerRootView>
      )}
    </View>
  );
}
