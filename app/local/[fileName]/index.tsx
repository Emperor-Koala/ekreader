import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { getItem } from "expo-secure-store";
import { BookOpen } from "lucide-react-native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View
} from "react-native";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import { Text } from "~/components/ui/text";
import { Trash } from "~/lib/icons/Trash";
import { useOfflineDetails } from "~/lib/query/bookDetails";
import { useOfflineBookList } from "~/lib/query/bookLists";
import { SecureStorageKeys } from "~/lib/secureStorageKeys";

export default function BookDetails() {
  const server = getItem(SecureStorageKeys.server);
  const { fileName } = useLocalSearchParams<{ fileName: string }>();
  const { goBack } = useNavigation();

  const { data, isLoading, isError, error } = useOfflineDetails(fileName);

  const { deleteBook } = useOfflineBookList();

  const remove = useCallback(() => {
    deleteBook.mutate(
      data!, {
      onSuccess: goBack,
    });
  }, [data, deleteBook, goBack]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
      {isLoading ? (
        <ActivityIndicator className="m-8" />
      ) : isError ? (
        <Text>{error.message}</Text>
      ) : (
        <ScrollView
          className="p-4 flex flex-col gap-y-6"
          contentContainerClassName="pb-32"
        >
          <View className="flex flex-row gap-x-8">
            <View className="w-1/2 max-w-44 aspect-[0.7] bg-neutral-500 shadow">
              <Image
                className="w-full h-full"
                source={`${server}/api/v1/books/${data!.id}/thumbnail`}
                placeholder={require("~/assets/images/react-logo.png")}
              />
            </View>
            <View className="flex-1 flex flex-col my-2">
              <Text className="text-2xl font-semibold mb-1">
                {data!.metadata.title}
              </Text>
              <Text className="font-light mb-3">
                By {data!.metadata.authors.map(({ name }) => name).join(", ")}
              </Text>
              <Text>{data!.metadata.summary}</Text>
            </View>
          </View>
          <Link href={`/read/${fileName}`} asChild>
            <Button
              className="bg-purple-400 dark:bg-purple-600 flex-row gap-x-2 mt-4"
            >
              <BookOpen className="stroke-white" />
              <Text className="dark:text-white">Read</Text>
            </Button>
          </Link>
          <Button
            className="bg-purple-400 dark:bg-purple-600 flex-row gap-x-2 mt-4"
            onPress={remove}
          >
            <Trash className="stroke-white" />
            <Text className="dark:text-white">Delete</Text>
          </Button>
          {/* TODO: Extra meta info */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
