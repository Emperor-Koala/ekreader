import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { getItem } from "expo-secure-store";
import { BookOpen } from "lucide-react-native";
import { DateTime } from "luxon";
import { useCallback } from "react";
import {
  ActivityIndicator,
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
    <View className="flex-1 bg-neutral-200 dark:bg-neutral-900">
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
            <View className="w-1/2 max-w-44 mb-4 aspect-[0.7] bg-neutral-500 shadow">
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
              {data!.metadata.releaseDate && (
                <Text className="font-light">
                  {data!.metadata.releaseDate.toLocaleString(
                    DateTime.DATE_FULL,
                  )}
                </Text>
              )}
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
            </View>
          </View>
              <Text>{data!.metadata.summary}</Text>
          <View className="mt-4 flex-col gap-y-2">
            <Text className="font-medium text-lg">Metadata for Nerds</Text>
            <View className="flex-row">
              <Text className="flex-1 font-medium">Size</Text>
              <Text className="flex-[2]">{data!.size}</Text>
            </View>
            <View className="flex-row">
              <Text className="flex-1 font-medium">Format</Text>
              <Text className="flex-[2]">{data!.media.mediaProfile}</Text>
            </View>
            {
              data!.metadata.isbn && (
                <View className="flex-row">
                  <Text className="flex-1 font-medium">ISBN</Text>
                  <Text className="flex-[2]">{data!.metadata.isbn}</Text>
                </View>
              )
            }
            <View className="flex-row">
              <Text className="flex-1 font-medium">File</Text>
              <Text className="flex-[2]">{data!.url}</Text>
            </View>
            <View className="flex-row">
              <Text className="flex-1 font-medium">Created</Text>
              <Text className="flex-[2]">{data!.created.toLocaleString(DateTime.DATETIME_MED)}</Text>
            </View>
            <View className="flex-row">
              <Text className="flex-1 font-medium">Last Modified</Text>
              <Text className="flex-[2]">{data!.lastModified.toLocaleString(DateTime.DATETIME_MED)}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
