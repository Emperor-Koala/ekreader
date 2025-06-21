import React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

export const KeyboardView: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      {children}
    </TouchableWithoutFeedback>
  );
};
