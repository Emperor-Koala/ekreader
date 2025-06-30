import { Reader, Section, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { BottomSheetFlashList, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { HeaderBackButton } from "@react-navigation/elements";
import { useLocalSearchParams } from "expo-router";
import { getItem } from "expo-secure-store";
import { cssInterop } from "nativewind";
import React, { forwardRef, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Bookmark, Chapters } from "~/lib/icons";
import { SecureStorageKeys } from "~/lib/secureStorageKeys";

const BottomModal = cssInterop(BottomSheetModal, { className: 'style', handleClassName: 'handleStyle', bgClassName: 'backgroundStyle' });

export default function ReadBook() {
  const server = getItem(SecureStorageKeys.server);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const tocRef = useRef<BottomSheetModal>(null);

  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  // const bookFile = useQuery({
  //   queryKey: ['book-file', bookId],
  //   queryFn: async () => {
  //     const [response, error] = await tryCatch(
  //       axios.get(`${server}/api/v1/books/${bookId}/file`)
  //     );

  //     if (error) {
  //       // TODO handle error state
  //       return '';
  //     }

  //     console.debug(response);

  //     return btoa(response.data);
  //   },
  // });

  const [isFullScreen, setIsFullScreen] = useState(false);
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View 
        className={`${isFullScreen ? 'hidden' : ''} h-16 bg-gray-600 flex flex-row items-center`}
      >
        <HeaderBackButton tintColor="#ffffff"/>
        <View className="flex-1 flex flex-row justify-end">
          <Button variant="ghost">
            <Bookmark className="stroke-white" />
          </Button>
          <Button variant="ghost" onPress={() => tocRef.current?.present()}>
            <Chapters className="stroke-white" />
          </Button>
        </View>
      </View>
      <Reader
        src="https://s3.amazonaws.com/moby-dick/OPS/package.opf"
        // src="https://komga.empko.net/api/v1/books/0KTBR74SSVKNV/file.epub"
        // src={`${server}/api/v1/books/${bookId}/manifest/epub`}
        fileSystem={useFileSystem}
        width={width}
        height={isFullScreen ? height : height-insets.top}
        waitForLocationsReady
        onDoubleTap={() => {
          console.log("double tapped");
          setIsFullScreen((prev) => !prev);
        }}
      />

      <TableOfContents ref={tocRef} />
    </GestureHandlerRootView>
  );
}


// eslint-disable-next-line react/display-name
const TableOfContents = forwardRef<
  BottomSheetModal, 
  { 
    onPressSection?: (section: Section) => void;
    onClose?: () => void;
  }
>(({ onClose, onPressSection }, ref) => {

  const { toc, section } = useReader();

  const renderItem = React.useCallback(
    ({ item }: { item: Section }) => (
      <Button 
        key={item.id}
        variant="ghost"
        className="w-full flex flex-row justify-between items-center my-1"
        onPress={() => onPressSection?.(item)}
      >
        <Text className="italic">{item.label}</Text>
      </Button>
    ),
    [onPressSection, section]
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