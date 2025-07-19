import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { Library } from "../types/Library";

export const useLibraries = () =>
  useQuery({
    queryKey: ["home", "libraries"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/libraries");

      return z.array(Library).parse(response.data);
    },
  });

export const useLibrary = (libraryId: string) =>
  useQuery({
    queryKey: ["library", libraryId],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/libraries/${libraryId}`);

      return Library.parse(response.data);
    },
  });
