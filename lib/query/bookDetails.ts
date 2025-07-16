import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Book } from "../types/Book";
import { tryCatch } from "../utils";

export const useBookDetails = (bookId: string) => useQuery({
    queryKey: ['book-details', bookId],
    queryFn: async () => {
        // TODO try to fetch from local storage first
        // if not found, fetch from server
        const [response, error] = await tryCatch(
            axios.get(`/api/v1/books/${bookId}`)
        );

        if (error) throw error; // TODO handle this properly

        return Book.parse(response.data);
    },
});

export const useOfflineDetails = (fileName: string) => useQuery({
    queryKey: ['offline-book-details', fileName],
    queryFn: async () => {
        const [response, error] = await tryCatch(
            FileSystem.readAsStringAsync(`${FileSystem.documentDirectory}${fileName}.meta.json`)
        );
        
        if (error) throw error; // TODO handle this properly

        return Book.parse(JSON.parse(response));
    },
});