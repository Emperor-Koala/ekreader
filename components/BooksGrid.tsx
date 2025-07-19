import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';
import { z } from 'zod';
import { Book } from '~/lib/types/Book';
import { BookItem } from './BookItem';

interface BooksGridProps {
    books: { metadata: z.infer<typeof Book>; thumbnail?: string }[];
    offline?: boolean;
}

export const BooksGrid = ({ books, offline }: BooksGridProps) => {
    // TODO get viewport size
    return (
        <FlashList
            data={books}
            numColumns={2} // TODO This should be dynamic based on viewport size
            style={{ width: "100%", padding: 16 }}
            renderItem={({ item: book }) => (
                <View className="p-2">
                    <BookItem book={book.metadata} thumbnail={book.thumbnail} className="w-full" offline={offline} />
                </View>
            )} 
        />
    );
};