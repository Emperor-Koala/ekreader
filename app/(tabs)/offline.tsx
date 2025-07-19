import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  RefreshControl,
} from "react-native-gesture-handler";
import { BooksGrid } from "~/components/BooksGrid";
import { Text } from "~/components/ui/text";
import { useOfflineBookList } from "~/lib/query/bookLists";

export default function OfflinePage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useOfflineBookList();

  const refresh = useCallback(async () => {
    await queryClient.resetQueries({ queryKey: ["offlineBooks"] });
    refetch();
  }, [queryClient, refetch]);

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl onRefresh={refresh} refreshing={false} />
          }
        >
          <View className="flex-1 items-center justify-center">
            {isLoading ? (
              <ActivityIndicator />
            ) : isError ? (
              <Text>{error.message}</Text>
            ) : (
              <BooksGrid books={data!} offline />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
