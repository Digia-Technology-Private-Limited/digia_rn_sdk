import React from 'react';
import { View } from 'react-native';
import { VirtualStatelessWidget } from '../base/VirtualStatelessWidget';
import { VirtualWidget } from '../base/VirtualWidget';
import { RenderPayload } from '../../framework/render_payload';
import { FlexFitProps } from '../widget_props/flex_fit_props';

/**
 * VWFlexFit
 * - 'tight' -> Expanded equivalent: force child to fill available space (flex)
 * - 'loose' -> Flexible equivalent: allow child to be flexible but keep intrinsic sizing when possible
 */
export class VWFlexFit extends VirtualStatelessWidget<FlexFitProps> {
    constructor(options: {
        props: FlexFitProps;
        parent?: VirtualWidget;
        parentProps?: any;
        refName?: string;
        childGroups?: Map<string, VirtualWidget[]>;
        commonProps?: any;
    }) {
        super(options as any);
    }

    render(payload: RenderPayload): React.ReactNode {
        const child = this.child;
        if (!child) return this.empty();

        const flexFitType = this.props.flexFitType ?? undefined;
        const flexValue = this.props.flexValue ?? 1;

        const childElement = child.toWidget(payload) as React.ReactElement;

        if (flexFitType === 'tight') {
            // Expanded: make child fill available space
            return (
                <View style={{ flex: flexValue }}>
                    {childElement}
                </View>
            );
        }

        if (flexFitType === 'loose') {
            // Flexible (loose): allow child to size itself but give it flexGrow
            // use flexGrow so child may keep intrinsic size when not stretching
            return (
                <View style={{ flexGrow: flexValue, flexShrink: 1 }}>
                    {childElement}
                </View>
            );
        }

        // No flex behavior requested
        return childElement;
    }
}
