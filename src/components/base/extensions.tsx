import React from 'react';
import { RenderPayload } from '../../framework/render_payload';
import { VirtualWidget } from './VirtualWidget';

/**
 * Helper class to add extension-like methods to VirtualWidget arrays.
 */
export class VirtualWidgetArrayExtensions {
    /**
     * Converts an iterable of VirtualWidgets to an array of React nodes.
     * 
     * @param widgets - Iterable of VirtualWidgets
     * @param payload - RenderPayload for rendering
     * @returns Array of React nodes
     */
    static toWidgetArray(
        widgets: Iterable<VirtualWidget>,
        payload: RenderPayload
    ): React.ReactNode[] {
        return Array.from(widgets).map((child) => child.toWidget(payload));
    }
}
