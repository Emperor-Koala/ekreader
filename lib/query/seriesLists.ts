import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthContext } from "~/components/AuthProvider";
import { paginatedResponse } from "../types/PaginatedResponse";
import { Series } from "../types/Series";
import { tryCatch } from "../utils";

const PaginatedSeriesList = paginatedResponse(Series);

export const useRecentlyAddedSeriesList = () => {
  const { currentUser } = useAuthContext();

  return useInfiniteQuery({
    queryKey: ["recently-added-book-list", currentUser?.data?.id],
    queryFn: async ({ pageParam }) => {
      const [response, error] = await tryCatch(
        axios.get(
          '/api/v1/series/new',
          {
            params: {
              oneshot: false
            },
          }
        )
      );

      if (error) throw error; // TODO handle this properly

      return PaginatedSeriesList.parse(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? null : lastPage.pageable.pageNumber+1;
    },
    enabled: !!currentUser,
  });
};