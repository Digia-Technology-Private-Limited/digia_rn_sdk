import React, { useEffect, useState } from 'react';
import {
    View,
    TouchableOpacity,
    ViewStyle,
    Platform,
    StyleSheet,
    Text,
} from 'react-native';

export type NavigationDestinationLabelBehavior = 'alwaysShow' | 'alwaysHide';

interface BottomNavigationBarProps {
    backgroundColor?: string | null;
    animationDuration?: number | null; // milliseconds
    selectedIndex?: number;
    destinations: React.ReactNode[];
    onDestinationSelected?: (index: number) => void;
    surfaceTintColor?: string | null;
    indicatorColor?: string | null;
    // indicatorShape left as any for now; consumer can pass a shape descriptor
    indicatorShape?: any | null;
    height?: number | null;
    elevation?: number | null;
    labelBehavior?: NavigationDestinationLabelBehavior | null;
    overlayColor?: string | null;
    shadow?: any[] | null;
    borderRadius?: number | null;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
    backgroundColor,
    animationDuration,
    selectedIndex = 0,
    destinations,
    onDestinationSelected,
    indicatorColor,
    height = 56,
    elevation,
    labelBehavior = 'alwaysShow',
    borderRadius,
    shadow,
}) => {
    const [internalIndex, setInternalIndex] = useState<number>(selectedIndex ?? 0);

    useEffect(() => {
        if (selectedIndex != null && selectedIndex !== internalIndex) {
            setInternalIndex(selectedIndex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIndex]);

    const handlePress = (index: number) => {
        setInternalIndex(index);
        onDestinationSelected?.(index);
    };

    const containerStyle: ViewStyle = {
        height: height ?? 56,
        backgroundColor: backgroundColor ?? undefined,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        borderRadius: borderRadius ?? 0,
        overflow: 'hidden',
    };

    if (elevation != null) {
        if (Platform.OS === 'android') {
            (containerStyle as any).elevation = elevation;
        } else {
            (containerStyle as any).shadowColor = '#000';
            (containerStyle as any).shadowOffset = { width: 0, height: (elevation as number) / 2 };
            (containerStyle as any).shadowOpacity = 0.3;
            (containerStyle as any).shadowRadius = elevation as number;
        }
    }

    return (
        <View style={{ borderRadius: borderRadius ?? 0, overflow: 'hidden' }}>
            <View style={[containerStyle]}>
                {destinations.map((dest, i) => {
                    const isSelected = i === internalIndex;
                    return (
                        <TouchableOpacity
                            key={`nav-dest-${i}`}
                            activeOpacity={0.7}
                            onPress={() => handlePress(i)}
                            style={styles.itemTouch}
                        >
                            <View style={styles.itemContainer}>
                                <View style={isSelected ? [styles.selectedOverlay, { backgroundColor: indicatorColor ?? 'transparent' }] : undefined} />
                                {/* Render provided destination node */}
                                {dest}
                                {/* Optionally show label when alwaysShow; if dest is a composite element that includes label,
                    consumers should provide it. We provide a fallback for plain strings. */}
                                {labelBehavior === 'alwaysShow' && typeof dest === 'string' ? (
                                    <Text style={styles.label}>{dest}</Text>
                                ) : null}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    decorated: {
        // ensure borderRadius clipping is preserved
    },
    itemTouch: {
        flex: 1,
    },
    itemContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
    },
    selectedOverlay: {
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: 6,
        height: 4,
        borderRadius: 2,
    },
    label: {
        fontSize: 12,
        marginTop: 2,
    },
});

export default BottomNavigationBar;
