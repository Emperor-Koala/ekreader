import { Tabs } from "expo-router";
import { Download } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "~/components/HapticTab";
import { House, Settings } from "~/lib/icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="(library)"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <House color={color} />,
        }}
      />
      <Tabs.Screen
        name="(offline)"
        options={{
          headerTitle: "Offline Downloads",
          title: "Offline",
          tabBarIcon: ({ color }) => <Download color={color} />,
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
    </Tabs>
  );
}
