import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { useAuthContext } from "~/components/AuthProvider";
import { Library } from "../types/Library";

export const useLibraries = () =>
  useQuery({
    queryKey: ["home", "libraries"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/libraries");

      return z.array(Library).parse(response.data);
    },
  });

export const useLibrary = (libraryId: string) => {
  const { currentUser } = useAuthContext();

  return useQuery({
    queryKey: ["library", libraryId, currentUser.data?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/libraries/${libraryId}`);

      return Library.parse(response.data);
    },
  });
};
