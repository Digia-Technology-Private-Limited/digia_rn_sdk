import React from 'react';
import { Image as RNImage, ImageStyle, ImageSourcePropType } from 'react-native';

interface ImageProps {
  props?: {
    src?: string;
    uri?: string;
    source?: ImageSourcePropType;
    style?: ImageStyle;
    visible?: boolean;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  };
}

/**
 * Image component - Maps to Flutter Image
 */
export const ImageComponent: React.FC<ImageProps> = ({ props }) => {
  const { src, uri, source, style, visible = true, resizeMode = 'cover' } = props || {};

  if (!visible) {
    return null;
  }

  // Determine the image source
  let imageSource: ImageSourcePropType;
  
  if (source) {
    imageSource = source;
  } else if (uri || src) {
    imageSource = { uri: uri || src };
  } else {
    console.warn('Image component requires either src, uri, or source prop');
    return null;
  }

  return <RNImage source={imageSource} style={style} resizeMode={resizeMode} />;
};
