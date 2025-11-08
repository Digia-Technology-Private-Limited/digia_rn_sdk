import React from 'react';
import { View, ViewStyle } from 'react-native';

interface ContainerProps {
  props?: {
    style?: ViewStyle;
    visible?: boolean;
  };
  children?: React.ReactNode;
}

/**
 * Container component - Maps to Flutter Container/View
 */
export const ContainerComponent: React.FC<ContainerProps> = ({ props, children }) => {
  const { style, visible = true } = props || {};

  if (!visible) {
    return null;
  }

  return <View style={style}>{children}</View>;
};
