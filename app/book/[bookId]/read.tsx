import { Bookmark, Reader, Section, useReader } from "@epubjs-react-native/core";
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
import { BookmarkIcon, Chapters, CloseIcon } from "~/lib/icons";
import { VoidCallback } from "~/lib/types";

const BottomModal = cssInterop(BottomSheetModal, { className: 'style', handleClassName: 'handleStyle', bgClassName: 'backgroundStyle' });

export default function ReadBook() {

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { goBack } = useNavigation();

  const tocRef = useRef<BottomSheetModal>(null);
  const bookmarksRef = useRef<BottomSheetModal>(null);

  const { bookId } = useLocalSearchParams<{ bookId: string }>();

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
    tocRef?.current?.dismiss();
  }, [tocRef]);

  const closeBookmarks = useCallback(() => {
    bookmarksRef?.current?.dismiss();
  }, [bookmarksRef]);

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
            <BookmarkIcon stroke={colors.text} fill={isBookmarked ? colors.text : ''} />
          </Button>
          <Button variant="ghost" onPress={() => tocRef.current?.present()}>
            <Chapters stroke={colors.text} />
          </Button>
        </View>
      </View>
      <Reader
        src={FileSystem.documentDirectory + `${bookId}.epub`}
        fileSystem={useFileSystem}
        width={width}
        height={isFullScreen ? height : height-insets.top}
        waitForLocationsReady
        onDoubleTap={() => {
          console.log("double tapped");
          setIsFullScreen((prev) => !prev);
        }}
      />

      <TableOfContents ref={tocRef} close={closeToC} />
      <BookmarksList ref={bookmarksRef} close={closeBookmarks} />
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

  const { bookmarks, getCurrentLocation, goToLocation } = useReader();

  const currentLocation = getCurrentLocation();

  const renderItem = useCallback(
    ({ item }: { item: Bookmark }) => {
      const mark = ( item.location.start.cfi === currentLocation?.start.cfi &&
                      item.location.end.cfi === currentLocation?.end.cfi );
      return (
        <View className="flex flex-row">
          <Button
            key={item.id}
            variant={mark ? "outline" : "ghost"}
            className="w-full native:h-16 flex flex-row justify-start items-center gap-x-4 my-1 native:py-2"
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
          {/* TODO: Delete button */}
        </View>
      );
    },
    [goToLocation, close, currentLocation]
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