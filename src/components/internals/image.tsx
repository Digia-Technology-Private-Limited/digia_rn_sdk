import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
    ActivityIndicator,
    Text,
    StyleSheet,
} from 'react-native';
import { RenderPayload } from '../../framework/render_payload';
import { DefaultScopeContext } from '../../framework/expr/default_scope_context';

export interface InternalImageProps {
    imageSourceExpr?: any;
    payload: RenderPayload;
    imageType?: string; // 'auto' | 'svg' | 'file' etc.
    style?: StyleProp<ImageStyle>;
    placeholderSrc?: string;
    errorImage?: string | { errorSrc?: string };
}

/**
 * InternalImage
 * - If imageType === 'file' or evaluated source looks like a local file (object with path/uri),
 *   render it directly without render-size based optimization.
 * - Otherwise render network/asset images normally.
 */
export const InternalImage: React.FC<InternalImageProps> = ({
    imageSourceExpr,
    payload,
    imageType,
    style,
    placeholderSrc,
    errorImage,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);
    const [source, setSource] = useState<ImageSourcePropType | null>(null);
    const [isSvgSource, setIsSvgSource] = useState<boolean>(false);

    // Helper to detect file-like objects
    const isFileLike = (v: any) => {
        if (!v) return false;
        if (typeof v === 'object') {
            return !!(v.path || v.uri || v.filePath);
        }
        return false;
    };

    useEffect(() => {
        setLoading(true);
        setError(null);

        try {
            // Evaluate the image expression without render-dimensions for file detection
            const raw = payload.eval<any>(imageSourceExpr);

            const declaredType = (imageType || 'auto').toLowerCase();

            if (declaredType === 'file' || isFileLike(raw)) {
                // If it's a file-like object, use its path/uri or pass through if it's already an ImageSource
                if (typeof raw === 'string') {
                    setSource({ uri: raw } as ImageSourcePropType);
                } else if (raw && typeof raw === 'object') {
                    const uri = raw.uri ?? raw.path ?? raw.filePath;
                    if (uri) {
                        setSource({ uri } as ImageSourcePropType);
                    } else {
                        // If the object already matches ImageSourcePropType (like {uri})
                        setSource((raw as unknown) as ImageSourcePropType);
                    }
                } else {
                    setSource(null);
                }
                setLoading(false);
                // mark svg if declared as svg and it's a string uri
                if (declaredType === 'svg') {
                    if (typeof raw === 'string' && raw.trim().toLowerCase().endsWith('.svg')) {
                        setIsSvgSource(true);
                    }
                }
                return;
            }

            // Non-file case: evaluate with optional render hints (we don't calculate size here)
            const evaluated = payload.eval<any>(imageSourceExpr, {
                scopeContext: new DefaultScopeContext({ variables: {} }),
            });

            if (typeof evaluated === 'string') {
                // If it's a URL or an asset name
                if (evaluated.startsWith('http') || evaluated.startsWith('file://') || evaluated.startsWith('content://')) {
                    setSource({ uri: evaluated } as ImageSourcePropType);
                    if ((imageType || '').toLowerCase() === 'svg' || evaluated.trim().toLowerCase().endsWith('.svg')) {
                        setIsSvgSource(true);
                    } else {
                        setIsSvgSource(false);
                    }
                } else {
                    // Treat as asset name — dynamic require isn't possible, use uri and hope RN resolves
                    setSource({ uri: evaluated } as ImageSourcePropType);
                    setIsSvgSource(false);
                }
            } else if (isFileLike(evaluated)) {
                const uri = evaluated.uri ?? evaluated.path ?? evaluated.filePath;
                setSource({ uri } as ImageSourcePropType);
                setIsSvgSource(false);
            } else if (evaluated && typeof evaluated === 'object') {
                setSource((evaluated as unknown) as ImageSourcePropType);
                setIsSvgSource(false);
            } else {
                setSource(null);
                setIsSvgSource(false);
            }

            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    }, [imageSourceExpr, payload, imageType]);

    if (loading) {
        if (placeholderSrc) {
            return (
                <Image source={{ uri: placeholderSrc }} style={[styles.image, style]} />
            );
        }
        return (
            <View style={[styles.center, style as any]}>
                <ActivityIndicator />
            </View>
        );
    }

    if (error) {
        // show errorImage or text in debug
        let errSrc: string | undefined;
        if (typeof errorImage === 'string') errSrc = errorImage;
        else if (errorImage && typeof errorImage === 'object') errSrc = (errorImage as any).errorSrc;

        if (errSrc) {
            return <Image source={{ uri: errSrc }} style={[styles.image, style]} />;
        }

        return (
            <View style={[styles.center, style as any]}>
                <Text style={{ color: 'red' }}>{String(error)}</Text>
            </View>
        );
    }

    if (!source) {
        return <View style={[styles.center, style as any]} />;
    }
    // If the source is an SVG (either declared or by uri), try to render using react-native-svg's SvgUri.
    const uri = (source as any)?.uri;
    const looksLikeSvg = isSvgSource || (typeof uri === 'string' && String(uri).toLowerCase().endsWith('.svg'));

    if (looksLikeSvg) {
        try {
            // Try to require react-native-svg at runtime. This avoids a hard peer dependency.
            // If not present, fall back to the regular Image component.
            // Note: typing is intentionally `any` to avoid build-time type dependency.
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const SvgModule: any = require('react-native-svg');
            const SvgUri = SvgModule?.SvgUri || SvgModule?.default?.SvgUri;
            if (SvgUri) {
                // SvgUri expects width/height; use 100% to fill container
                return (
                    <View style={[styles.image, style as any]}>
                        <SvgUri uri={uri} width="100%" height="100%" />
                    </View>
                );
            }
        } catch (e) {
            // ignore - we'll fall back to Image below
        }
    }

    return (
        <Image
            source={source}
            style={[styles.image, style]}
            onError={(e) => setError(e.nativeEvent)}
            resizeMode={(style as any)?.resizeMode ?? 'cover'}
        />
    );
};

const styles = StyleSheet.create({
    image: { width: '100%', },
    center: { justifyContent: 'center', alignItems: 'center' },
});
