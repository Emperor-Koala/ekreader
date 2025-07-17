import { Bookmark, Reader, Section, Themes, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { BottomSheetFlashList, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { HeaderBackButton } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { cssInterop } from "nativewind";
import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { BookmarkIcon, Chapters, CloseIcon, Settings } from "~/lib/icons";
import { Trash } from "~/lib/icons/Trash";
import { VoidCallback } from "~/lib/types";

const BottomModal = cssInterop(BottomSheetModal, { className: 'style', handleClassName: 'handleIndicatorStyle', bgClassName: 'backgroundStyle' });

export default function ReadBook() {

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { goBack } = useNavigation();

  const tocRef = useRef<BottomSheetModal>(null);
  const bookmarksRef = useRef<BottomSheetModal>(null);
  const settingsRef = useRef<BottomSheetModal>(null);

  const { fileName } = useLocalSearchParams<{ fileName: string }>();

  const { bookmarks, isBookmarked, addBookmark, removeBookmark, getCurrentLocation } = useReader();

  const toggleBookmark = useCallback(() => {
    const location = getCurrentLocation();
    if (!location) return;


    if (isBookmarked) {
       const bookmark = bookmarks.find(
        (item) =>
          item.location.start.cfi === location?.start.cfi &&
          item.location.end.cfi === location?.end.cfi
      );

      if (!bookmark) return;
      removeBookmark(bookmark);
    } else {
      addBookmark(location);
    }
  }, [getCurrentLocation, addBookmark, removeBookmark, isBookmarked, bookmarks]);

  const closeToC = useCallback(() => {
    tocRef.current?.dismiss();
  }, [tocRef]);

  const closeBookmarks = useCallback(() => {
    bookmarksRef.current?.dismiss();
  }, [bookmarksRef]);

  const closeSettings = useCallback(() => {
    settingsRef.current?.dismiss();
  }, [settingsRef]);

  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        paddingTop: isFullScreen ? insets.top : 0,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        backgroundColor: colors.card,
      }}
    >
      <View 
        className={`${isFullScreen ? 'hidden' : ''} flex flex-row items-center`}
        style={{ paddingTop: insets.top, backgroundColor: colors.card, }}
      >
        <HeaderBackButton tintColor={colors.text} onPress={goBack} />
        <View className="flex-1 flex flex-row justify-end">
          <Button
            variant="ghost"
            onPress={toggleBookmark}
            onLongPress={() => bookmarksRef.current?.present()}
          >
            <BookmarkIcon stroke={colors.text} fill={isBookmarked ? colors.text : 'transparent'} />
          </Button>
          <Button variant="ghost" onPress={() => tocRef.current?.present()}>
            <Chapters stroke={colors.text} />
          </Button>
          <Button variant="ghost" onPress={() => settingsRef.current?.present()}>
            <Settings stroke={colors.text} />
          </Button>
        </View>
      </View>
      <Reader
        src={FileSystem.documentDirectory + `${fileName}.epub`}
        fileSystem={useFileSystem}
        width={width}
        height={isFullScreen ? height : height-insets.top}
        waitForLocationsReady
        onDoubleTap={() => {
          setIsFullScreen((prev) => !prev);
        }}
      />

      <TableOfContents ref={tocRef} close={closeToC} />
      <BookmarksList ref={bookmarksRef} close={closeBookmarks} />
      <SettingsSheet ref={settingsRef} close={closeSettings} />
    </GestureHandlerRootView>
  );
}

// eslint-disable-next-line react/display-name
const TableOfContents = forwardRef<
  BottomSheetModalMethods, 
  { close: VoidCallback; }
>(({close}, ref) => {

  const { toc, section, goToLocation } = useReader();

  const renderItem = useCallback(
    ({ item }: { item: Section }) => (
      <Button
        key={item.id}
        variant={item.id === section?.id ? "outline" : "ghost"}
        className="w-full flex flex-row justify-between items-center my-1"
        onPress={() => {
          goToLocation(item.href.split('/')[1]);
          close();
        }}
      >
        <Text className="italic">{item.label}</Text>
      </Button>
    ),
    [goToLocation, close, section]
  );

  return (
    <BottomSheetModalProvider>
      <BottomModal
        ref={ref}
        index={0}
        snapPoints={['50%', '90%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        className="w-full flex-1 px-5 mt-4 shadow shadow-neutral-800"
        bgClassName="dark:bg-neutral-700"
        handleClassName="dark:bg-neutral-300"
      >
        <View className="flex flex-row items-center justify-between">
          <Text className="text-2xl font-semibold">
            Table of Contents
          </Text>

          <Button variant="ghost" onPress={close}>
            <CloseIcon className="dark:stroke-white" />
          </Button>
        </View>
        <BottomSheetFlashList
          data={toc}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ width: '100%' }}
        />
      </BottomModal>
    </BottomSheetModalProvider>
  );
});

// eslint-disable-next-line react/display-name
const BookmarksList = forwardRef<
  BottomSheetModalMethods, 
  { close: VoidCallback; }
>(({close}, ref) => {

  const { bookmarks, getCurrentLocation, goToLocation, removeBookmark } = useReader();

  const currentLocation = getCurrentLocation();

  const renderItem = useCallback(
    ({ item }: { item: Bookmark }) => {
      const mark = ( item.location.start.cfi === currentLocation?.start.cfi &&
                      item.location.end.cfi === currentLocation?.end.cfi );
      return (
        <View className="flex flex-row items-center">
          <Button
            key={item.id}
            variant={mark ? "outline" : "ghost"}
            className="flex-1 native:h-16 flex flex-row justify-start items-center gap-x-4 my-1 native:py-2"
            onPress={() => {
              goToLocation(item.location.start.cfi);
              close();
            }}
          >
            <View className="flex flex-col items-center">
              <BookmarkIcon className="stroke-white fill-white" />
              <Text>{item.location.start.location}</Text>
            </View>
            <View>
              <Text>Chapter:</Text>
              <Text className="italic" numberOfLines={1}>{item.text}</Text>
            </View>
          </Button>
          <Button variant="ghost" onPress={() => removeBookmark(item)}>
            <Trash className="stroke-red-500" />
          </Button>
        </View>
      );
    },
    [goToLocation, close, currentLocation, removeBookmark]
  );

  const sorted = useMemo(
    () => bookmarks.sort((a, b) => a.location.start.location - b.location.start.location), 
    [bookmarks],
  );

  return (
    <BottomSheetModalProvider>
      <BottomModal
        ref={ref}
        index={0}
        snapPoints={['50%', '90%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        className="w-full flex-1 px-5 mt-4 shadow shadow-neutral-800"
        bgClassName="dark:bg-neutral-700"
        handleClassName="dark:bg-neutral-300"
      >
        <View className="flex flex-row items-center justify-between">
          <Text className="text-2xl font-semibold">
            Bookmarks
          </Text>

          <Button variant="ghost" onPress={close}>
            <CloseIcon className="dark:stroke-white" />
          </Button>
        </View>
        <BottomSheetFlashList
          data={sorted}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderItem}
          style={{ width: '100%' }}
        />
      </BottomModal>
    </BottomSheetModalProvider>
  );
});

const MAX_FONT_SIZE = 32;
const MIN_FONT_SIZE = 10;

// eslint-disable-next-line react/display-name
const SettingsSheet = forwardRef<
  BottomSheetModalMethods,
  { close: VoidCallback; }
>(({ close }, ref) => {
  const {
    changeTheme,
    changeFontSize,
    changeFontFamily,
    changeFlow,
  } = useReader();

  const [selectedTheme, setSelectedTheme] = useState<keyof typeof Themes>('LIGHT');
  const [font, setFont] = useState<string>("Helvetica");
  const [fontSize, setFontSize] = useState(16);
  const [ flow, setFlow ] = useState<'paginated' | 'scrolled'>('paginated');

  const updateTheme = useCallback((newTheme: string | undefined) => {
    if (!newTheme) return;
    setSelectedTheme(newTheme as keyof typeof Themes);
    changeTheme(Themes[newTheme as keyof typeof Themes]);
  }, [changeTheme]);

  const updateFont = useCallback((newFont: string | undefined) => {
    if (!newFont) return;
    setFont(newFont);
    changeFontFamily(newFont);
  }, [changeFontFamily]);

  const increaseFontSize = () => {
    if (fontSize < MAX_FONT_SIZE) {
      setFontSize(fontSize + 1);
      changeFontSize(`${fontSize + 1}px`);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > MIN_FONT_SIZE) {
      setFontSize(fontSize - 1);
      changeFontSize(`${fontSize - 1}px`);
    }
  };

  const updateFlow = useCallback((newFlow: string | undefined) => {
    if (!newFlow) return;
    setFlow(newFlow as 'paginated' | 'scrolled');
    changeFlow(newFlow as 'paginated' | 'scrolled');
  }, [changeFlow]);

  return (
    <BottomSheetModalProvider>
      <BottomModal
        ref={ref}
        index={0}
        snapPoints={['35%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        className="w-full flex-1 px-5 mt-4 shadow shadow-neutral-800"
        bgClassName="dark:bg-neutral-700"
        handleClassName="dark:bg-neutral-300"
      >
        <View className="flex flex-row justify-end">
          <Button variant="ghost" onPress={close}>
            <CloseIcon className="dark:stroke-white" />
          </Button>
        </View>
        <ToggleGroup type="single" onValueChange={updateTheme} value={selectedTheme} className="justify-start">
          <ToggleGroupItem value="LIGHT" size="lg">
            <View className="w-8 h-8 bg-white border border-black dark:border-none rounded-full"></View>
          </ToggleGroupItem>
          <ToggleGroupItem value="DARK" size="lg">
            <View className="w-8 h-8 bg-black dark:border dark:border-white rounded-full"></View>
          </ToggleGroupItem>
          <ToggleGroupItem value="SEPIA" size="lg">
            <View className="w-8 h-8 bg-amber-200 dark:border dark:border-white rounded-full"></View>
          </ToggleGroupItem>
        </ToggleGroup>
        <View className="flex flex-row items-center gap-x-2 mt-4">
          <ToggleGroup type="single" onValueChange={updateFont} value={font}>
            <ToggleGroupItem value="Helvetica" size="lg">
              <Text className="font-[Helvetica]">Aa</Text>
            </ToggleGroupItem>
            <ToggleGroupItem value="Georgia" size="lg">
              <Text className="font-[Georgia]">Aa</Text>
            </ToggleGroupItem>
            <ToggleGroupItem value="Courier New" size="lg">
              <Text className="font-[Courier]">Aa</Text>
            </ToggleGroupItem>
          </ToggleGroup>
          <View className="flex-1 flex flex-row items-center justify-evenly">
            <Button variant="secondary" onPress={decreaseFontSize} disabled={fontSize <= MIN_FONT_SIZE} size="icon">
              <Text className="text-2xl">-</Text>
            </Button>
            <Text className="w-12 text-lg text-center">{fontSize}</Text>
            <Button variant="secondary" onPress={increaseFontSize} disabled={fontSize >= MAX_FONT_SIZE} size="icon">
              <Text className="text-2xl">+</Text>
            </Button>
          </View>
        </View>
        <ToggleGroup type="single" onValueChange={updateFlow} value={flow} className="justify-center mt-4">
          <ToggleGroupItem value="paginated" size="lg" className="flex-1">
            <Text>Paginated</Text>
          </ToggleGroupItem>
          <ToggleGroupItem value="scrolled" size="lg" className="flex-1">
            <Text>Scrolled</Text>
          </ToggleGroupItem>
        </ToggleGroup>
      </BottomModal>
    </BottomSheetModalProvider>
  );
});