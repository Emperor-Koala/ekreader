import { Link, useLocalSearchParams } from "expo-router";
import { getItem } from "expo-secure-store";
import { ActivityIndicator, SafeAreaView, ScrollView, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import { Text } from "~/components/ui/text";
import { BookOpen } from "~/lib/icons";
import { useBookDetails } from "~/lib/query/bookDetails";
import { SecureStorageKeys } from "~/lib/secureStorageKeys";

export default function BookDetails() {
  const server = getItem(SecureStorageKeys.server);
  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  const {data, isLoading, isError, error} = useBookDetails(bookId);

  return (
    <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
      {isLoading ? (
        <ActivityIndicator className="m-8" />
      ) : isError ? (
        <Text>{error.message}</Text>
      ) : (
        <ScrollView className="p-4 flex flex-col gap-y-6" contentContainerClassName="pb-32">
            <View className="flex flex-row gap-x-8">
                <View className="w-1/2 max-w-44 aspect-[0.7] bg-neutral-500 shadow">
                    <Image 
                        className="w-full h-full"
                        source={`${server}/api/v1/books/${data!.id}/thumbnail`}
                        placeholder={require("~/assets/images/react-logo.png")}
                    />
                </View>
                <View className="flex-1 flex flex-col my-2">
                    <Text className="text-2xl font-semibold mb-1">{data!.metadata.title}</Text>
                    <Text className="font-light mb-3">By {data!.metadata.authors.map(({name}) => name).join(', ')}</Text>
                    <Text>{data!.metadata.summary}</Text>
                </View>
            </View>
            <View className="flex flex-row justify-center p-2">
                <Link href={`/book/${bookId}/read`} asChild>
                    <Button className="bg-purple-400 dark:bg-purple-600 flex-row gap-x-2">
                        <BookOpen className="stroke-white" />
                        <Text className="dark:text-white">Read</Text>
                    </Button>
                </Link>
            </View>
            {/* TODO: Extra meta info */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
