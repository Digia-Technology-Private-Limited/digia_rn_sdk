declare module 'react-native-vector-icons/MaterialIcons' {
    import { Component } from 'react';
    import { TextProps } from 'react-native';

    export interface IconProps extends TextProps {
        name: string;
        size?: number;
        color?: string;
        style?: any;
    }

    export default class MaterialIcons extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/Ionicons' {
    import { Component } from 'react';
    import { TextProps } from 'react-native';

    export interface IconProps extends TextProps {
        name: string;
        size?: number;
        color?: string;
        style?: any;
    }

    export default class Ionicons extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/FontAwesome' {
    import { Component } from 'react';
    import { TextProps } from 'react-native';

    export interface IconProps extends TextProps {
        name: string;
        size?: number;
        color?: string;
        style?: any;
    }

    export default class FontAwesome extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/FontAwesome5' {
    import { Component } from 'react';
    import { TextProps } from 'react-native';

    export interface IconProps extends TextProps {
        name: string;
        size?: number;
        color?: string;
        style?: any;
        solid?: boolean;
        brand?: boolean;
    }

    export default class FontAwesome5 extends Component<IconProps> { }
}
