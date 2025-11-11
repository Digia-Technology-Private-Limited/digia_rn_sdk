import React from 'react';
import { VirtualLeafStatelessWidget } from '../base/VirtualLeafStatelessWidget';
import { IconProps } from '../widget_props/icon_props';
import { CommonProps } from '../../framework/models/common_props';
import { VirtualWidget } from '../base/VirtualWidget';
import { RenderPayload } from '../../framework/render_payload';
import { SimpleIcon } from '../internals/icon';
import { Props } from '../../framework/models/props';


export class VWIcon extends VirtualLeafStatelessWidget<IconProps> {
    constructor(options: {
        props: IconProps;
        commonProps?: CommonProps;
        parentProps?: Props;
        parent?: VirtualWidget;
        refName?: string;
    }) {
        super(options);
    }

    render(payload: RenderPayload): React.ReactNode {
        const iconData = payload.getIcon(this.props.iconData);
        const size = payload.evalExpr(this.props.size) ?? 24;
        const color = payload.evalColorExpr(this.props.color) ?? '#000000';

        if (!iconData) {
            console.warn('Icon data not found:', this.props.iconData);
            return null;
        }


        if (!iconData) {
            console.warn('Failed to deserialize icon:', iconData);
            return null;
        }

        return <SimpleIcon {...iconData} size={size} color={color} />;
    }
}