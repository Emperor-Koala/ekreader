import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthContext } from "~/components/AuthProvider";
import { Book } from "../types/Book";
import { paginatedResponse } from "../types/PaginatedResponse";
import { tryCatch } from "../utils";

const PaginatedBookList = paginatedResponse(Book);

export const useKeepReadingList = () => {
  const { currentUser } = useAuthContext();

  return useInfiniteQuery({
    queryKey: ["keep-reading-book-list", currentUser?.data?.id],
    queryFn: async ({ pageParam }) => {
      const [response, error] = await tryCatch(
        axios.post(
          '/api/v1/books/list',
          {
            condition: {
              readStatus: {
                operator: "is",
                value: "IN_PROGRESS"
              }
            }
          },
          {
            params: {
              sort: 'readProgress.readDate,desc',
              page: pageParam,
            },
          }
        )
      );

      if (error) throw error; // TODO handle this properly

      return PaginatedBookList.parse(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? null : lastPage.pageable.pageNumber+1;
    },
    enabled: !!currentUser,
  });
};

export const useRecentlyAddedBooksList = () => {
  const { currentUser } = useAuthContext();

  return useInfiniteQuery({
    queryKey: ["recently-added-book-list", currentUser?.data?.id],
    queryFn: async ({ pageParam }) => {
      const [response, error] = await tryCatch(
        axios.post(
          '/api/v1/books/list',
          {},
          {
            params: {
              sort: 'createdDate,desc',
              page: pageParam,
            },
          }
        )
      );

      if (error) throw error; // TODO handle this properly

      return PaginatedBookList.parse(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? null : lastPage.pageable.pageNumber+1;
    },
    enabled: !!currentUser,
  });
};
