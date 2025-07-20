import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { z } from "zod";
import { Book } from "~/lib/types/Book";
import { BookItem } from "./BookItem";

interface BooksGridProps {
  books: { metadata: z.infer<typeof Book>; thumbnail?: string }[];
  offline?: boolean;
}

export const BooksGrid = ({ books, offline }: BooksGridProps) => {
  const { width } = useSafeAreaFrame();
  const numColumns = width < 400 ? 2 : width < 800 ? 3 : 4;
  return (
    <FlashList
      data={books}
      numColumns={numColumns}
      style={{ width: "100%" }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      renderItem={({ item: book }) => (
        <View className="p-2">
          <BookItem
            book={book.metadata}
            thumbnail={book.thumbnail}
            className="w-full"
            offline={offline}
          />
        </View>
      )}
    />
  );
};
