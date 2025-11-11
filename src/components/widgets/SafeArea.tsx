import React from 'react';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { VirtualStatelessWidget } from '../base/VirtualStatelessWidget';
import { SafeAreaProps } from '../widget_props/safe_area_props';
import { VirtualWidget } from '../base/VirtualWidget';
import { RenderPayload } from '../../framework/render_payload';
import { CommonProps } from '../../framework/models/common_props';
import { Props } from '../../framework/models/props';

/**
 * SafeArea virtual widget.
 * Evaluates boolean flags (left/top/right/bottom) via RenderPayload and
 * renders the child inside a platform SafeAreaView. Note: left/right insets
 * are best-effort because the project does not depend on a safe-area-context library.
 */
export class VWSafeArea extends VirtualStatelessWidget<SafeAreaProps> {
    constructor(options: {
        props: SafeAreaProps;
        commonProps?: CommonProps;
        parentProps?: Props;
        parent?: VirtualWidget;
        childGroups?: Map<string, VirtualWidget[]>;
        refName?: string;
    }) {
        super(options as any);
    }

    render(payload: RenderPayload): React.ReactNode {
        const left = payload.evalExpr(this.props.left) ?? true;
        const top = payload.evalExpr(this.props.top) ?? true;
        const right = payload.evalExpr(this.props.right) ?? true;
        const bottom = payload.evalExpr(this.props.bottom) ?? true;

        // Build edges array only when we need to restrict insets. If all edges
        // are true we omit `edges` to let SafeAreaView apply all insets.
        const allTrue = top && bottom && left && right;
        const edges: Edge[] = [];
        if (top) edges.push('top');
        if (bottom) edges.push('bottom');
        if (left) edges.push('left');
        if (right) edges.push('right');

        return (
            <SafeAreaView edges={allTrue ? undefined : edges}>
                {this.child?.toWidget(payload) ?? this.empty()}
            </SafeAreaView>
        );
    }
}
