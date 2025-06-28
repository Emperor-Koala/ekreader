import { Link } from "expo-router";
import { getItem } from "expo-secure-store";
import { TouchableOpacity, View } from "react-native";
import { z } from "zod";
import { SecureStorageKeys } from "~/lib/secureStorageKeys";
import { Book } from "~/lib/types/Book";
import { Image } from "./ui/image";
import { Text } from "./ui/text";

export const BookItem = ({ book }: { book: z.infer<typeof Book> }) => {
  const server = getItem(SecureStorageKeys.server);
  return (
    <Link href={`/book/${book.id}`} asChild>
        <TouchableOpacity activeOpacity={0.75}>
        <View className="bg-neutral-100 dark:bg-neutral-700 shadow-sm p-1.5 rounded w-32">
            <Image
            source={`${server}/api/v1/books/${book.id}/thumbnail`}
            placeholder={require("~/assets/images/react-logo.png")}
            className="w-full aspect-[0.7] bg-neutral-500"
            />
            <Text
            className="text-lg pt-2 w-full"
            numberOfLines={book.oneshot ? 2 : 1}
            >
            {book.metadata.title}
            </Text>
            {!book.oneshot && (
            <Text className="text-lg font-light w-full" numberOfLines={1}>
                {book.seriesTitle}
            </Text>
            )}
            <Text className="font-extralight">{book.media.pagesCount} pages</Text>
        </View>
        </TouchableOpacity>
    </Link>
  );
};
