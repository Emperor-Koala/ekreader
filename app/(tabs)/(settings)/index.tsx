import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { useAuthContext } from "~/components/AuthProvider";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

const SettingsScreen = () => {
  const router = useRouter();

  const { currentUser, logout } = useAuthContext();

  const { toggleColorScheme } = useColorScheme();
  // If logged in, show:
  // - image reader settings
  //   - upscaling/downscaling methods
  //   - load small previews when dragging nav slider
  // - epub reader settings

  return (
    <SafeAreaView className="flex-1 bg-neutral-200 dark:bg-neutral-900">
      <ScrollView className="py-6 px-4">
        {currentUser.isLoading ? (
          <ActivityIndicator />
        ) : !currentUser.data ? (
          <>
            <Button
              onPress={() => router.push("/(tabs)/(settings)/login")}
              className="items-start mb-6"
              variant="secondary"
            >
              <Text>Log In to Komga...</Text>
            </Button>

            <Button
              onPress={toggleColorScheme}
              className="items-start"
              variant="secondary"
            >
              <Text className="dark:text-white">Appearance</Text>
            </Button>
          </>
        ) : (
          <>
            <View className="group flex items-start justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 bg-secondary px-4 py-2 native:px-5 native:py-3 mb-2">
              <Text className="text-lg">Logged in as:</Text>
              <Text className="text-lg">{currentUser.data.email}</Text>
            </View>
            <Button
              onPress={() => logout.mutate()}
              className="items-start mb-6"
              variant="secondary"
            >
              <Text style={{ color: "red", fontWeight: "bold" }}>
                Log Out...
              </Text>
              {logout.isPending && (
                <ActivityIndicator size="small" color="#000" />
              )}
            </Button>

            <Button
              onPress={toggleColorScheme}
              className="items-start"
              variant="secondary"
            >
              <Text className="dark:text-white">Appearance</Text>
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default SettingsScreen;
