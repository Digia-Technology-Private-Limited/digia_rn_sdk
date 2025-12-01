import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Dimensions,
    ViewStyle,
    StyleSheet,
    LayoutChangeEvent,
    TouchableWithoutFeedback,
    Animated,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    withTiming,
} from "react-native-reanimated";
import { ScalingDot, SlidingDot } from "react-native-animated-pagination-dots";
// Indicator package

type IndicatorEffectType =
    | "slide"
    | "scale"
    // future: "worm" | "jumping" | "scrolling" | "expanding" | "swap" | "circleAroundDot"
    ;

type InternalCarouselProps = {
    itemBuilder?: (ctx: { index: number }) => React.ReactNode;
    children?: React.ReactNode[];
    itemCount?: number;
    width?: number;
    height?: number;
    direction?: "horizontal" | "vertical";
    aspectRatio?: number; // itemWidth / itemHeight or used to compute height from width
    keepAlive?: boolean;
    initialPage?: number;
    enlargeCenterPage?: boolean;
    viewportFraction?: number; // fraction of carousel width each item occupies (0..1)
    autoPlay?: boolean;
    animationDuration?: number; // ms
    autoPlayInterval?: number; // ms
    infiniteScroll?: boolean;
    reverseScroll?: boolean;
    enlargeFactor?: number; // scale factor (0.0..1.0) -> finalScale = 1 + enlargeFactor
    showIndicator?: boolean;
    offset?: number;
    dotHeight?: number;
    dotWidth?: number;
    padEnds?: boolean;
    spacing?: number;
    pageSnapping?: boolean;
    dotColor?: string;
    activeDotColor?: string;
    indicatorEffectType?: 'slide' | 'scale';
    onChanged?: (index: number) => void;
};




export default function InternalCarousel(props: InternalCarouselProps) {
    const {
        itemBuilder,
        children = [],
        itemCount = 0,
        direction = "horizontal",
        aspectRatio = 0.25,
        width, // can be undefined
        height,
        viewportFraction = 0.8,
        initialPage = 0,
        autoPlay = false,
        autoPlayInterval = 1600,
        infiniteScroll = false,
        showIndicator = false,
        indicatorEffectType = "slide",
        dotWidth = 8,
        spacing = 12,
        activeDotColor = "#3F51B5",
        dotColor = "#C0C0C0",
        onChanged,
    } = props;

    const dataLength = itemBuilder ? itemCount : children.length;

    const scrollX = useRef(new Animated.Value(0)).current;
    const [activeIndex, setActiveIndex] = useState(initialPage);

    /** Real layout width (Flutter-like viewport) */
    const [layoutWidth, setLayoutWidth] = useState<number | null>(null);

    const onLayout = (e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (layoutWidth !== w) setLayoutWidth(w);
    };

    /** Compute actual viewport (Flutter-like) */
    const viewportWidth = width ?? layoutWidth;
    const itemWidth = useMemo(() => {
        return viewportWidth ? viewportWidth * viewportFraction : 0;
    }, [viewportWidth, viewportFraction]);

    const carouselHeight = useMemo(() => {
        if (height) return height;
        if (!viewportWidth) return 200; // temp height until layout
        return viewportWidth * aspectRatio;
    }, [viewportWidth, height, aspectRatio]);

    /** ScrollX animation for indicator */
    useEffect(() => {
        Animated.timing(scrollX, {
            toValue: activeIndex * itemWidth,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [activeIndex, itemWidth]);

    /** Render item like Flutter PageView.builder */
    const renderItem = ({ index }: { index: number }) => {
        const node = itemBuilder ? itemBuilder({ index }) : children[index];
        return (
            <View style={{ width: itemWidth, alignItems: "center", justifyContent: "center" }}>
                {node}
            </View>
        );
    };

    const handleSnap = (i: number) => {
        setActiveIndex(i);
        onChanged?.(i);
    };

    /** Indicator */
    const Indicator = () => {
        if (!showIndicator || dataLength <= 1) return null;

        const baseProps = {
            data: Array.from({ length: dataLength }) as Object[],
            scrollX: scrollX, // FIXED: Animated.Value
            dotSize: dotWidth,
            dotScale: 1.4,
            activeDotColor,
            inActiveDotColor: dotColor,
            spacing,
            containerStyle: { marginTop: 12 },
        };

        return indicatorEffectType === "scale"
            ? <ScalingDot {...baseProps} />
            : <SlidingDot {...baseProps} />;
    };

    return (
        <View
            style={{
                width: width ?? "100%",

            }}
            onLayout={onLayout}
        >
            {viewportWidth && (
                <>
                    {/* Carousel */}
                    <Carousel
                        width={itemWidth}
                        height={carouselHeight}
                        data={Array.from({ length: dataLength })}
                        renderItem={renderItem}
                        defaultIndex={initialPage}
                        loop={infiniteScroll}
                        autoPlay={autoPlay}
                        autoPlayInterval={autoPlayInterval}
                        onSnapToItem={handleSnap}
                        vertical={direction === "vertical"}
                        scrollAnimationDuration={800}
                        style={{ alignSelf: "center" }}
                    />

                    {/* Indicator placed directly BELOW the carousel, not overlapping */}
                    {showIndicator && (
                        <View
                            style={{
                                height: 24,
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: 8,
                            }}
                        >
                            <Indicator />
                        </View>
                    )}
                </>
            )}
        </View>
    );

}
