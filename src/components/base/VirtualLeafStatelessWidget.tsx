import React from 'react';
import { View } from 'react-native';
import { VirtualWidget } from './VirtualWidget';
import { RenderPayload } from '../../framework/render_payload';
import { CommonProps } from '../../framework/models/common_props';
import { wrapInContainer, wrapInAlign, wrapInGestureDetector } from '../../framework/utils/widget_util';
import { To } from '../../framework/utils/type_convertors';
import { DefaultErrorWidget } from './default_error_widget';
import { Props } from '../../framework/models/props';

export abstract class VirtualLeafStatelessWidget<T> extends VirtualWidget {
    props: T;
    commonProps?: CommonProps;

    constructor(options: {
        props: T;
        commonProps?: CommonProps;
        parent?: VirtualWidget;
        refName?: string;
        parentProps?: Props;
    }) {
        super({
            parent: options.parent,
            refName: options.refName,
            parentProps: options.parentProps,
        });
        this.props = options.props;
        this.commonProps = options.commonProps;
    }

    toWidget(payload: RenderPayload): React.ReactElement {
        try {
            // Extend hierarchy with this widget's name for observability
            const extendedPayload =
                this.refName != null
                    ? payload.withExtendedHierarchy(this.refName)
                    : payload;

            if (this.commonProps == null) {
                const rendered = this.render(extendedPayload);
                return rendered as React.ReactElement;
            }

            const isVisible =
                this.commonProps?.visibility?.evaluate(extendedPayload.scopeContext) ??
                true;
            if (!isVisible) {
                return this.empty() as React.ReactElement;
            }

            let current = this.render(extendedPayload) as React.ReactElement;

            // Styling
            current = wrapInContainer({
                payload: extendedPayload,
                style: this.commonProps!.style,
                child: current,
            });

            // Align
            current = wrapInAlign({
                value: this.commonProps!.align,
                child: current,
            });

            current = wrapInGestureDetector({
                payload: extendedPayload,
                actionFlow: this.commonProps?.onClick,
                child: current,
                borderRadius: typeof To.borderRadius(this.commonProps?.style?.borderRadius) === 'number'
                    ? To.borderRadius(this.commonProps?.style?.borderRadius) as number
                    : undefined,
            });

            // Margin should always be the last wrapper
            const marginValue = To.edgeInsets(this.commonProps?.style?.margin);
            let isZero = false;

            if (typeof marginValue === 'number') {
                isZero = marginValue === 0;
            } else if (typeof marginValue === 'string') {
                isZero = marginValue === '0';
            } else if (typeof marginValue === 'object') {
                const m = marginValue as { paddingTop?: number; paddingRight?: number; paddingBottom?: number; paddingLeft?: number };
                isZero = (m.paddingTop ?? 0) === 0 &&
                    (m.paddingRight ?? 0) === 0 &&
                    (m.paddingBottom ?? 0) === 0 &&
                    (m.paddingLeft ?? 0) === 0;
            }

            if (!isZero) {
                if (typeof marginValue === 'number') {
                    current = (
                        <View style={{ margin: marginValue }}>
                            {current}
                        </View>
                    );
                } else if (typeof marginValue === 'object') {
                    const m = marginValue as { paddingTop?: number; paddingRight?: number; paddingBottom?: number; paddingLeft?: number };
                    current = (
                        <View
                            style={{
                                marginTop: m.paddingTop,
                                marginRight: m.paddingRight,
                                marginBottom: m.paddingBottom,
                                marginLeft: m.paddingLeft,
                            }}
                        >
                            {current}
                        </View>
                    );
                }
            }

            return current;
        } catch (error) {
            // In debug mode or dashboard, show error widget
            if (__DEV__) {
                return (
                    <DefaultErrorWidget
                        refName={this.refName}
                        errorMessage={String(error)}
                        errorDetails={error}
                    />
                );
            } else {
                throw error;
            }
        }
    }

    empty(): React.ReactElement {
        return <View style={{ display: 'none' }} />;
    }
}
