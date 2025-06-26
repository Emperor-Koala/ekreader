import { getItem } from "expo-secure-store";
import { TouchableOpacity, View } from "react-native";
import { z } from "zod";
import { Book } from "~/lib/types/Book";
import { Image } from "./ui/image";
import { Text } from "./ui/text";

export const BookItem = ({book}: {book: z.infer<typeof Book>}) => {
    const server = getItem('server');
    return (
        <TouchableOpacity activeOpacity={0.75}> 
            <View className="bg-neutral-100 dark:bg-neutral-700 shadow-sm p-1.5 rounded">
                <Image
                    source={`${server}/api/v1/books/${book.id}/thumbnail`}
                    placeholder={require('~/assets/images/react-logo.png')}
                    className="w-28 h-40 bg-neutral-500"
                />
                <Text className="text-lg pt-2">
                    {book.metadata.title}
                </Text>
            </View>
        </TouchableOpacity>
    );
};