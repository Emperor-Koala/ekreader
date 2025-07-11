import * as FileSystem from "expo-file-system";
import { Link, useLocalSearchParams } from "expo-router";
import { getItem } from "expo-secure-store";
import { BookOpen } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import { Text } from "~/components/ui/text";
import { Download } from "~/lib/icons/Download";
import { Trash } from "~/lib/icons/Trash";
import { useBookDetails } from "~/lib/query/bookDetails";
import { SecureStorageKeys } from "~/lib/secureStorageKeys";

export default function BookDetails() {
  const server = getItem(SecureStorageKeys.server);
  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  const { data, isLoading, isError, error } = useBookDetails(bookId);

  const [isDownloaded, setIsDownloaded] = useState<boolean | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(-1);

  const onDownloadProgress = useCallback(
    (progress: FileSystem.DownloadProgressData) => {
      setDownloadProgress(
        Math.round(
          (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
            100,
        ),
      );
    },
    [],
  );

  const downloadBook = useCallback(async () => {
    await FileSystem.createDownloadResumable(
      `${server}/api/v1/books/${bookId}/file`,
      FileSystem.documentDirectory + `${bookId}.epub`,
      {},
      onDownloadProgress,
    ).downloadAsync();
    setIsDownloaded(true);
    setDownloadProgress(-1);
  }, [server, bookId, onDownloadProgress]);

  useEffect(() => {
    const checkIfDownloaded = async () => {
      const fileInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + `${bookId}.epub`,
      );
      setIsDownloaded(fileInfo.exists);
    };
    checkIfDownloaded();
  }, [bookId]);

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
          {isDownloaded === null ? (
            <></>
          ) : !isDownloaded ? (
            <Button
              className="bg-purple-400 dark:bg-purple-600 flex-row gap-x-2 mt-4"
              onPress={downloadBook}
              disabled={downloadProgress >= 0}
            >
              <Download className="stroke-white" />
              <Text className="dark:text-white">Download</Text>
            </Button>
          ) : (
            <>
              <Link href={`/book/${bookId}/read`} asChild>
                <Button
                  className="bg-purple-400 dark:bg-purple-600 flex-row gap-x-2 mt-4"
                  disabled={downloadProgress >= 0}
                >
                  <BookOpen className="stroke-white" />
                  <Text className="dark:text-white">Read</Text>
                </Button>
              </Link>
              <Button
                className="bg-purple-400 dark:bg-purple-600 flex-row gap-x-2 mt-4"
                onPress={() => {
                  // TODO implement
                }}
              >
                <Trash className="stroke-white" />
                <Text className="dark:text-white">Delete</Text>
              </Button>
            </>
          )}
          {downloadProgress > -1 && (
            <View className="bg-neutral-300 h-1 my-4 w-full rounded-full">
              <View
                style={{ width: `${downloadProgress}%` }}
                className="bg-purple-500 h-1 rounded-full"
              ></View>
            </View>
          )}
          {/* TODO: Extra meta info */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
