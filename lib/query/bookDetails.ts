import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Book } from "../types/Book";

export const useBookDetails = (bookId: string) => useQuery({
    queryKey: ['book-details', bookId],
    queryFn: async () => {
        const response = await axios.get(`/api/v1/books/${bookId}`);
        return Book.parse(response.data);
    },
});

export const useOfflineDetails = (fileName: string) => useQuery({
    queryKey: ['offline-book-details', fileName],
    queryFn: async () => {
        const response = await FileSystem.readAsStringAsync(`${FileSystem.documentDirectory}${fileName}.meta.json`);
        return Book.parse(JSON.parse(response));
    },
});