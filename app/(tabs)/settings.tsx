import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SettingsScreen = () => {

    // if not loggwed in, show only login option
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
                <TouchableOpacity>
                    <View style={styles.row}>
                        <Text>Log Out</Text>
                    </View>
                </TouchableOpacity>
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
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
    }
});