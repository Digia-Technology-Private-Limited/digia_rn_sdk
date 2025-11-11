import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';
import { VirtualStatelessWidget } from '../base/VirtualStatelessWidget';
import { Props } from '../../framework/models/props';
import { RenderPayload } from '../../framework/render_payload';
import { VirtualWidget } from '../base/VirtualWidget';
import { To } from '../../framework/utils/type_convertors';
import { CommonProps } from '../../framework/models/common_props';

/**
 * VWDrawer - port of the Flutter VWDrawer to React Native
 *
 * The original Flutter Drawer maps to a platform drawer; here we implement a
 * simple container that applies background/shadow/width/elevation and renders
 * its `child`.
 */
export class VWDrawer extends VirtualStatelessWidget<Props> {
    constructor(options: {
        props: Props;
        commonProps?: CommonProps;
        parentProps?: Props;
        parent?: VirtualWidget;
        childGroups?: Map<string, VirtualWidget[]>;
        refName?: string;
    }) {
        super(options as any);
    }

    render(payload: RenderPayload): React.ReactNode {
        const bg = payload.evalColor(this.props.get('backgroundColor')) ?? undefined;
        const shadow = payload.evalColor(this.props.get('shadowColor')) ?? undefined;
        const surfaceTint = payload.evalColor(this.props.get('surfaceTintColor')) ?? undefined;
        const semanticLabel = payload.eval<string>(this.props.get('semanticLabel')) ?? undefined;
        const clip = To.alignment(this.props.get('clipBehavior')) ?? undefined; // best-effort
        const width = payload.eval<number>(this.props.get('width')) ?? undefined;
        const elevation = payload.eval<number>(this.props.get('elevation')) ?? undefined;

        const style: ViewStyle = {
            backgroundColor: bg ?? surfaceTint ?? undefined,
            width: width ?? undefined,
        };

        // Map elevation -> shadow for iOS/Android
        if (elevation != null) {
            if (Platform.OS === 'android') {
                style.elevation = elevation;
            } else {
                // iOS shadow approximation
                style.shadowColor = shadow ?? '#000';
                style.shadowOffset = { width: 0, height: elevation / 2 } as any;
                style.shadowOpacity = 0.3;
                style.shadowRadius = elevation;
            }
        }

        // Render the primary child (uses key 'child' by convention)
        const childWidget = this.child;

        return (
            <View accessible={!!semanticLabel} accessibilityLabel={semanticLabel} style={style}>
                {childWidget?.toWidget(payload)}
            </View>
        );
    }
}
