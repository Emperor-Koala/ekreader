import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { getItem } from "expo-secure-store";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { z } from "zod";
import { useAuthContext } from "~/components/AuthProvider";
import { SecureStorageKeys } from "../secureStorageKeys";
import { VoidCallback } from "../types";
import { Book } from "../types/Book";
import { paginatedResponse } from "../types/PaginatedResponse";

const PaginatedBookList = paginatedResponse(Book);

export const useKeepReadingList = () => {
  const { currentUser } = useAuthContext();

  return useInfiniteQuery({
    queryKey: ["home", "book-list", "keep-reading", currentUser.data?.id],
    queryFn: async ({ pageParam }) => {
      const response = await axios.post(
        "/api/v1/books/list",
        {
          condition: {
            readStatus: {
              operator: "is",
              value: "IN_PROGRESS",
            },
          },
        },
        {
          params: {
            sort: "readProgress.readDate,desc",
            page: pageParam,
          },
        },
      );

      return PaginatedBookList.parse(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? null : lastPage.pageable.pageNumber + 1;
    },
    enabled: !!currentUser,
  });
};

export const useRecentlyAddedBooksList = () => {
  const { currentUser } = useAuthContext();

  return useInfiniteQuery({
    queryKey: ["home", "book-list", "recently-added", currentUser.data?.id],
    queryFn: async ({ pageParam }) => {
      const response = await axios.post(
        "/api/v1/books/list",
        {},
        {
          params: {
            sort: "createdDate,desc",
            page: pageParam,
          },
        },
      );

      return PaginatedBookList.parse(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? null : lastPage.pageable.pageNumber + 1;
    },
    enabled: !!currentUser,
  });
};

export const useLibraryBooks = (libraryId: string) => {
  const { currentUser } = useAuthContext();

  return useInfiniteQuery({
    queryKey: ["library", "book-list", libraryId, currentUser.data?.id],
    queryFn: async ({ pageParam }) => {
      const response = await axios.post(
        "/api/v1/books/list",
        {
          condition: {
            allOf: [
              {
                libraryId: {
                  operator: "is",
                  value: libraryId,
                },
              },
            ],
          },
        },
        {
          params: {
            sort: "series,metadata.numberSort,asc",
            page: pageParam,
          },
        },
      );

      return PaginatedBookList.parse(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? null : lastPage.pageable.pageNumber + 1;
    },
  });
};

export const useSeriesBooks = (seriesId: string) => {
  const { currentUser } = useAuthContext();

  return useInfiniteQuery({
    queryKey: ["series", "book-list", seriesId, currentUser.data?.id],
    queryFn: async ({ pageParam }) => {
      const response = await axios.post(
        "/api/v1/books/list",
        {
          condition: {
            allOf: [
              {
                seriesId: {
                  operator: "is",
                  value: seriesId,
                },
              },
            ],
          },
        },
        {
          params: {
            sort: "metadata.numberSort,asc",
            page: pageParam,
          },
        },
      );

      return PaginatedBookList.parse(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? null : lastPage.pageable.pageNumber + 1;
    },
  });
};

export const useOfflineBookList = () => {
  const server = getItem(SecureStorageKeys.server);

  const queryClient = useQueryClient();

  const cookieHeader = useMemo(() => {
    const session = getItem(SecureStorageKeys.session);
    const rememberMe = getItem(SecureStorageKeys.remember);
  
    let cookie = [];
    if (session) {
      cookie.push(`${SecureStorageKeys.session}=${session}`);
    }
    if (rememberMe) {
      if (rememberMe.includes(";")) {
        const [value, expiry] = rememberMe.split(";");
        if (DateTime.fromMillis(parseInt(expiry)) >= DateTime.now()) {
          cookie.push(`${SecureStorageKeys.remember}=${value}`);
        }
      } else {
        cookie.push(`${SecureStorageKeys.remember}=${rememberMe}`);
      }
    }

    return cookie.join(';');
  }, []);

  const query = useQuery({
    queryKey: ["offlineBooks"],
    queryFn: async () => {
      const files = (
        await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!)
      )
        .filter((file) => file.endsWith(".meta.json"))
        .map((file) => file.replace(".meta.json", ""));

      const books = await Promise.all(
        files.map(async (file) => {
          const metadata = await FileSystem.readAsStringAsync(
            FileSystem.documentDirectory + `${file}.meta.json`,
          );
          return {
            metadata: Book.parse(JSON.parse(metadata)),
            thumbnail: `${FileSystem.documentDirectory}${file}.thumbnail`,
          };
        }),
      );
      return books;
    },
  });

  const downloadBook = useMutation({
    mutationKey: ["downloadBook"],
    mutationFn: async ({
      book,
      onDownloadProgress,
    }: {
      book: z.infer<typeof Book>;
      onDownloadProgress: VoidCallback<FileSystem.DownloadProgressData>;
    }) => {
      const fileName = `${book.metadata.title}-${book.id}`;

      return Promise.all([
        FileSystem.createDownloadResumable(
          `${server}/api/v1/books/${book.id}/file`,
          FileSystem.documentDirectory + `${fileName}.epub`,
          {
            headers: {
              cookie: cookieHeader,
            }
          },
          onDownloadProgress,
        ).downloadAsync(),
        FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + `${fileName}.meta.json`,
          JSON.stringify(book),
        ),
        FileSystem.createDownloadResumable(
          `${server}/api/v1/books/${book.id}/thumbnail`,
          FileSystem.documentDirectory + `${fileName}.thumbnail`,
        ).downloadAsync(),
      ]);
    },
    onSuccess: (_, { book }) => {
      queryClient.setQueryData(
        ["offlineBooks"],
        (
          oldData:
            | { metadata: z.infer<typeof Book>; thumbnail: string }[]
            | undefined,
        ) => {
          if (!oldData)
            return [
              {
                metadata: book,
                thumbnail: `${FileSystem.documentDirectory}${book.metadata.title}-${book.id}.thumbnail`,
              },
            ];
          return [
            ...oldData,
            {
              metadata: book,
              thumbnail: `${FileSystem.documentDirectory}${book.metadata.title}-${book.id}.thumbnail`,
            },
          ];
        },
      );
    },
    onError: (error, { book }) => {
      console.error(`Failed to download book ${book.metadata.title}:`, error);
      FileSystem.deleteAsync(
        FileSystem.documentDirectory + `${book.metadata.title}-${book.id}.epub`,
        { idempotent: true },
      );
      FileSystem.deleteAsync(
        FileSystem.documentDirectory +
          `${book.metadata.title}-${book.id}.meta.json`,
        { idempotent: true },
      );
      FileSystem.deleteAsync(
        FileSystem.documentDirectory +
          `${book.metadata.title}-${book.id}.thumbnail`,
        { idempotent: true },
      );
    },
  });

  const deleteBook = useMutation({
    mutationKey: ["deleteBook"],
    mutationFn: async (book: z.infer<typeof Book>) => {
      const fileName = `${book.metadata.title}-${book.id}`;
      await Promise.all([
        FileSystem.deleteAsync(
          FileSystem.documentDirectory + `${fileName}.epub`,
          { idempotent: true },
        ),
        FileSystem.deleteAsync(
          FileSystem.documentDirectory + `${fileName}.meta.json`,
          { idempotent: true },
        ),
        FileSystem.deleteAsync(
          FileSystem.documentDirectory + `${fileName}.thumbnail`,
          { idempotent: true },
        ),
      ]);
    },
    onSuccess: (_, book) => {
      queryClient.setQueryData(
        ["offlineBooks"],
        (
          oldData:
            | { metadata: z.infer<typeof Book>; thumbnail: string }[]
            | undefined,
        ) => {
          if (!oldData) return [];
          return oldData.filter(({ metadata }) => metadata.id !== book.id);
        },
      );
    },
  });

  return {
    ...query,
    downloadBook,
    deleteBook,
  };
};
