import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Book } from "../types/Book";
import { tryCatch } from "../utils";

export const useBookDetails = (bookId: string) => useQuery({
    queryKey: ['book-details', bookId],
    queryFn: async () => {
        const [response, error] = await tryCatch(
            axios.get(`/api/v1/books/${bookId}`)
        );

        if (error) throw error; // TODO handle this properly

        return Book.parse(response.data);
    },
});