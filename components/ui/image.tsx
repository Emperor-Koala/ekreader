import { Image as RNImage } from "expo-image";
import { cssInterop } from "nativewind";
export const Image = cssInterop(RNImage, { className: "style" });
