import { Link } from "expo-router";
import { getItem } from "expo-secure-store";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { z } from "zod";
import { SecureStorageKeys } from "~/lib/secureStorageKeys";
import { Book } from "~/lib/types/Book";
import { cn } from "~/lib/utils";
import { Image } from "./ui/image";
import { Text } from "./ui/text";

export const BookItem = ({
  book,
  thumbnail,
  className,
  offline,
}: {
  book: z.infer<typeof Book>;
  thumbnail?: string;
  className?: string;
  offline?: boolean;
}) => {
  const server = getItem(SecureStorageKeys.server);
  const imageCookieHeader = useMemo(() => {
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

  return (
    <Link
      href={
        offline
          ? `(tabs)/(offline)/book/${book.metadata.title}-${book.id}`
          : `(tabs)/(library)/book/${book.id}`
      }
      asChild
    >
      <TouchableOpacity activeOpacity={0.75}>
        <View
          className={cn(
            "bg-neutral-100 dark:bg-neutral-700 shadow-sm p-1.5 rounded w-[9.5rem]",
            className,
          )}
        >
          <Image
            source={ thumbnail ?? {
              uri: `${server}/api/v1/books/${book.id}/thumbnail`, 
              headers: { cookie: imageCookieHeader },
            }}
            placeholder={require("~/assets/images/react-logo.png")}
            className="w-full aspect-[0.7] bg-neutral-500"
          />
          <Text className="text-lg pt-2 w-full" numberOfLines={2}>
            {book.metadata.title}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};
