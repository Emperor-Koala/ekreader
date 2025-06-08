import { useRouter } from "expo-router";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuthContext } from "~/components/AuthProvider";

const SettingsScreen = () => {

    const router = useRouter();

    const { currentUser, logout } = useAuthContext();
    // If logged in, show:
    // - account info
    // - logout option
    // - appearance
    // - image reader settings
    //   - upscaling/downscaling methods
    //   - load small previews when dragging nav slider
    // - epub reader settings


    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="py-6">
                {currentUser.isLoading && (<ActivityIndicator />)}
                {!currentUser.data ? (
                    <TouchableOpacity onPress={() => router.push("/(tabs)/(settings)/login")}>
                        <View className="px-6 py-4 border-t border-b flex flex-row gap-3 border-gray-300">
                            <Text>Log In to Komga...</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <>
                        <View className="px-6 py-4 border-t border-b flex flex-row gap-3 border-gray-300">
                            <Text>Logged in as:</Text>
                            <Text>{currentUser.data.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => logout.mutate()}>
                            <View className="px-6 py-4 border-t border-b flex flex-row gap-3 border-gray-300">
                                <Text style={{color: 'red', fontWeight: 'bold'}}>Log Out...</Text>
                                {logout.isPending && <ActivityIndicator size="small" color="#000" />}
                            </View>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => Toast.show({
                            type: 'info',
                            text1: 'Feature Coming Soon',
                            text2: 'This feature is not yet implemented.',
                            // position: 'bottom',
                            // bottomOffset: 90,
                            topOffset: 60,
                        })}>
                            <View className="px-6 py-4 border-t border-b flex flex-row gap-3 border-gray-300">
                                <Text>Test Toast</Text>
                            </View>
                        </TouchableOpacity> */}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};
export default SettingsScreen;
