import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export interface SimpleIconProps {
    name: string;
    family: string;
    size?: number;
    color?: string;
    style?: any;
}

export const SimpleIcon: React.FC<SimpleIconProps> = ({
    name,
    family,
    size = 24,
    color = '#000000',
    style
}) => {
    const iconProps = { name, size, color, style };

    switch (family) {
        case 'MaterialIcons':
            return <MaterialIcons {...iconProps} />;
        case 'Ionicons':
            return <Ionicons {...iconProps} />;
        case 'FontAwesome':
            return <FontAwesome {...iconProps} />;
        case 'FontAwesome5':
            return <FontAwesome5 {...iconProps} />;
        default:
            // Fallback to MaterialIcons
            return <MaterialIcons {...iconProps} />;
    }
};