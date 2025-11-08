import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  props?: {
    text?: string;
    onPress?: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    visible?: boolean;
  };
}

/**
 * Button component - Maps to Flutter ElevatedButton
 */
export const ButtonComponent: React.FC<ButtonProps> = ({ props }) => {
  const { text = '', onPress, style, textStyle, visible = true } = props || {};

  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text style={textStyle}>{text}</Text>
    </TouchableOpacity>
  );
};
