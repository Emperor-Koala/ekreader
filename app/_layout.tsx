import { ReaderProvider } from "@epubjs-react-native/core";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { AuthProvider } from "~/components/AuthProvider";
import "~/global.css";
import { NAV_THEME } from "~/lib/constants";
import "~/lib/http";
import { useColorScheme } from "~/lib/useColorScheme";

const queryClient = new QueryClient();

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ReaderProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Library" }} />
              <Stack.Screen name="book/[bookId]" options={{ title: "" }} />
              <Stack.Screen name="local/[fileName]" options={{ title: "" }} />
              <Stack.Screen name="read/[fileName]" options={{ headerShown: false }} />
              <Stack.Screen name="library/[libraryId]" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
            <Toast />
          </ReaderProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
