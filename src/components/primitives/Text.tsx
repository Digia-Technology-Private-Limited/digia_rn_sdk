import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';

interface TextProps {
  props?: {
    text?: string;
    style?: TextStyle;
    visible?: boolean;
  };
}

/**
 * Text component - Maps to Flutter Text
 */
export const TextComponent: React.FC<TextProps> = ({ props }) => {
  const { text = '', style, visible = true } = props || {};

  if (!visible) {
    return null;
  }

  return <RNText style={style}>{text}</RNText>;
};
