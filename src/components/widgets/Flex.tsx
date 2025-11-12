import React from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import { VirtualStatelessWidget } from '../base/VirtualStatelessWidget';
import { VirtualWidget } from '../base/VirtualWidget';
import { DefaultScopeContext } from '../../framework/expr/default_scope_context';
import { ScopeContext } from '../../framework/expr/scope_context';
import { Props } from '../../framework/models/props';
import { RenderPayload } from '../../framework/render_payload';
import { To } from '../../framework/utils/type_convertors';
import { FlexFitProps } from '../widget_props/flex_fit_props';
import { VWFlexFit } from './FlexFit';

export class VWFlex extends VirtualStatelessWidget<Props> {
    direction: 'horizontal' | 'vertical';

    constructor(options: {
        direction: 'horizontal' | 'vertical';
        props: Props;
        commonProps?: any;
        parent?: VirtualWidget;
        refName?: string;
        childGroups?: Map<string, VirtualWidget[]>;
    }) {
        super(options as any);
        this.direction = options.direction;
    }

    get shouldRepeatChild(): boolean {
        return this.props.get('dataSource') != null;
    }

    render(payload: RenderPayload): React.ReactNode {
        const children = this.children;
        if (!children || children.length === 0) return this.empty();

        const flexWidget = this.shouldRepeatChild
            ? this._buildRepeatingFlex(payload)
            : this._buildStaticFlex(payload);

        return this._wrapWithScrollViewIfNeeded(flexWidget);
    }

    private _buildRepeatingFlex(payload: RenderPayload): React.ReactElement {
        const childToRepeat = this.children![0];
        const dataItems = payload.eval<any[]>(this.props.get('dataSource')) ?? [];

        const nodes = dataItems.map((item, index) => {
            const scopedPayload = payload.copyWithChainedContext(
                this._createExprContext(item, index)
            );

            const wrapped = this._wrapInFlexFit(childToRepeat, scopedPayload);
            return wrapped.toWidget(scopedPayload);
        });

        return this._buildFlex(() => nodes);
    }

    private _buildStaticFlex(payload: RenderPayload): React.ReactElement {
        const nodes = this.children!
            .map((child) => this._wrapInFlexFit(child, payload))
            .map((vw) => vw.toWidget(payload));

        return this._buildFlex(() => nodes);
    }

    private _wrapWithScrollViewIfNeeded(flexWidget: React.ReactElement): React.ReactElement {
        const isScrollable = this.props.getBool('isScrollable') === true;
        if (!isScrollable) return flexWidget;

        const horizontal = this.direction === 'horizontal';
        return (
            <ScrollView horizontal={horizontal}>
                {flexWidget}
            </ScrollView>
        );
    }

    private _wrapInFlexFit(childVirtualWidget: VirtualWidget, payload: RenderPayload): VirtualWidget {
        if (childVirtualWidget instanceof VWFlexFit) return childVirtualWidget;

        const parentProps = (childVirtualWidget as any).parentProps as Props | undefined;
        if (!parentProps) return childVirtualWidget;

        const expansionType = parentProps.getString('expansion.type');
        const flexValue = payload.eval<number>(parentProps.get('expansion.flexValue')) ?? 1;

        if (!expansionType) return childVirtualWidget;

        return new VWFlexFit({
            props: new FlexFitProps({
                flexFitType: expansionType,
                flexValue: flexValue,
            }),
            parent: this,
            childGroups: new Map([['child', [childVirtualWidget]]]),
        } as any);
    }

    // Build the actual flex container element
    private _buildFlex(childrenBuilder: () => React.ReactNode[]): React.ReactElement {
        const spacing = this.props.getDouble('spacing') ?? 0;
        const startSpacing = this.props.getDouble('startSpacing') ?? 0;
        const endSpacing = this.props.getDouble('endSpacing') ?? 0;

        const justifyContent = To.mainAxisAlignment(this.props.get('mainAxisAlignment')) ?? 'flex-start';
        const alignItems = To.crossAxisAlignment(this.props.get('crossAxisAlignment')) ?? 'center';

        const flexDirection = this.direction === 'horizontal' ? 'row' : 'column';

        const children = childrenBuilder();

        // Insert spacing between children
        const spaced: React.ReactNode[] = [];
        if (startSpacing > 0) spaced.push(<View key="start-space" style={{ width: this.direction === 'horizontal' ? startSpacing : undefined, height: this.direction === 'vertical' ? startSpacing : undefined }} />);

        children.forEach((c, i) => {
            spaced.push(React.isValidElement(c) ? React.cloneElement(c as any, { key: `child-${i}` }) : <React.Fragment key={`child-${i}`}>{c}</React.Fragment>);
            if (i < children.length - 1 && spacing > 0) {
                spaced.push(<View key={`space-${i}`} style={{ width: this.direction === 'horizontal' ? spacing : undefined, height: this.direction === 'vertical' ? spacing : undefined }} />);
            }
        });

        if (endSpacing > 0) spaced.push(<View key="end-space" style={{ width: this.direction === 'horizontal' ? endSpacing : undefined, height: this.direction === 'vertical' ? endSpacing : undefined }} />);

        const containerStyle: ViewStyle = {
            flexDirection: flexDirection as any,
            justifyContent: justifyContent as any,
            alignItems: alignItems as any,
        };

        return (
            <View style={containerStyle}>
                {spaced}
            </View>
        );
    }

    private _createExprContext(item: any, index: number): ScopeContext {
        const flexObj = {
            currentItem: item,
            index,
        };

        return new DefaultScopeContext({ variables: { ...flexObj } });
    }
}
