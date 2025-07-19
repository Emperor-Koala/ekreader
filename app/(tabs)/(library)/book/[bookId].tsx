import * as FileSystem from "expo-file-system";
import { Link, useLocalSearchParams } from "expo-router";
import { getItem } from "expo-secure-store";
import { BookOpen } from "lucide-react-native";
import { DateTime } from "luxon";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import { Text } from "~/components/ui/text";
import { Download } from "~/lib/icons/Download";
import { Trash } from "~/lib/icons/Trash";
import { useBookDetails } from "~/lib/query/bookDetails";
import { useOfflineBookList } from "~/lib/query/bookLists";
import { SecureStorageKeys } from "~/lib/secureStorageKeys";

export default function BookDetails() {
  const server = getItem(SecureStorageKeys.server);
  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  const { data, isLoading, isError, error } = useBookDetails(bookId);

  const [isDownloaded, setIsDownloaded] = useState<boolean | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(-1);

  const { downloadBook, deleteBook } = useOfflineBookList();

  const onDownloadProgress = useCallback(
    (progress: FileSystem.DownloadProgressData) => {
      if (progress.totalBytesWritten === progress.totalBytesExpectedToWrite) {
        return;
      }
      setDownloadProgress(
        Math.round(
          (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
            100,
        ),
      );
    },
    [],
  );

  const download = useCallback(() => {
    if (!data) {
      Alert.alert(
        "Error",
        "Book data is not available. Please try again later.",
        [{ text: "OK" }],
      );
      return;
    }

    downloadBook.mutate(
      {
        book: data,
        onDownloadProgress,
      },
      {
        onSettled: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for the download to settle
          setDownloadProgress(-1);
        },
        onSuccess: () => setIsDownloaded(true),
        onError: (error) => {
          Alert.alert(
            "Download Failed",
            error.message ||
              "There was an error downloading the book. Please try again later.",
            [{ text: "OK" }],
          );
          setIsDownloaded(false);
        },
      },
    );
  }, [data, onDownloadProgress, downloadBook]);

  const remove = useCallback(() => {
    deleteBook.mutate(data!, {
      onSuccess: () => setIsDownloaded(false),
    });
  }, [data, deleteBook]);

  useEffect(() => {
    const checkIfDownloaded = async () => {
      const fileName = `${data?.metadata.title}-${bookId}`;
      const fileInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + `${fileName}.epub`,
      );
      setIsDownloaded(fileInfo.exists);
    };
    checkIfDownloaded();
  }, [data, bookId]);

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
              {isDownloaded === null ? (
                <></>
              ) : !isDownloaded ? (
                <Button
                  className="bg-purple-400 dark:bg-purple-600 flex-row gap-x-2 mt-4"
                  onPress={download}
                  disabled={downloadProgress >= 0}
                >
                  <Download className="stroke-white" />
                  <Text className="dark:text-white">Download</Text>
                </Button>
              ) : (
                <>
                  <Link
                    href={`/read/${data!.metadata.title}-${bookId}`}
                    asChild
                  >
                    <Button className="bg-purple-400 dark:bg-purple-600 flex-row gap-x-2 mt-4">
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
                </>
              )}
              {downloadProgress > -1 && (
                <View className="bg-neutral-300 h-1 mt-3.5 w-full rounded-full">
                  <View
                    style={{ width: `${downloadProgress}%` }}
                    className="bg-purple-500 h-1 rounded-full"
                  ></View>
                </View>
              )}
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
            {data!.metadata.isbn && (
              <View className="flex-row">
                <Text className="flex-1 font-medium">ISBN</Text>
                <Text className="flex-[2]">{data!.metadata.isbn}</Text>
              </View>
            )}
            <View className="flex-row">
              <Text className="flex-1 font-medium">File</Text>
              <Text className="flex-[2]">{data!.url}</Text>
            </View>
            <View className="flex-row">
              <Text className="flex-1 font-medium">Created</Text>
              <Text className="flex-[2]">
                {data!.created.toLocaleString(DateTime.DATETIME_MED)}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="flex-1 font-medium">Last Modified</Text>
              <Text className="flex-[2]">
                {data!.lastModified.toLocaleString(DateTime.DATETIME_MED)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
