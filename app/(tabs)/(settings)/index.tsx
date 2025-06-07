import { useRouter } from "expo-router";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        <SafeAreaView style={styles.page}>
            <ScrollView contentContainerStyle={styles.body}>
                {currentUser.isLoading && (<ActivityIndicator />)}
                {!currentUser.data ? (
                    <TouchableOpacity onPress={() => router.push("/(tabs)/(settings)/login")}>
                        <View style={styles.row}>
                            <Text>Log In to Komga...</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <>
                        <View style={styles.row}>
                            <Text>Logged in as:</Text>
                            <Text>{currentUser.data.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => logout.mutate()}>
                            <View style={styles.row}>
                                <Text style={{color: 'red', fontWeight: 'bold'}}>Log Out...</Text>
                                {logout.isPending && <ActivityIndicator size="small" color="#000" />}
                            </View>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};
export default SettingsScreen;

const styles = StyleSheet.create({
    page: { flex: 1 },
    body: { paddingVertical: 24 },
    row: {
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: "#ccc",
        display: "flex",
        flexDirection: "row",
        gap: 12,
        // backgroundColor: "#fff",
    }
});