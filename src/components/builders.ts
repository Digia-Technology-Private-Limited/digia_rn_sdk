import { VirtualWidget } from './base/VirtualWidget';
import { VWData, VWNodeData } from '../framework/models/vw_data';
import { VirtualWidgetRegistry } from './virtual_widget_registry';
import { TextPropsClass } from './widget_props/text_props';
import { VWText } from './widgets/text';

/**
 * Create child groups from VWData, converting each to VirtualWidget instances.
 * 
 * Recursively builds the widget hierarchy by creating child widgets using the registry.
 * 
 * @param childGroups - Map of child group names to arrays of VWData
 * @param parent - The parent VirtualWidget
 * @returns Map of child group names to arrays of VirtualWidget instances, or undefined if no children
 * 
 * @example
 * ```typescript
 * const childGroups = new Map([
 *   ['children', [textData1, textData2]],
 *   ['actions', [buttonData]]
 * ]);
 * 
 * const widgets = createChildGroups(childGroups, parentWidget);
 * // Map {
 * //   'children' => [VWText, VWText],
 * //   'actions' => [VWButton]
 * // }
 * ```
 */
export function createChildGroups(
    childGroups: Map<string, VWData[]> | undefined,
    parent: VirtualWidget | undefined
): Map<string, VirtualWidget[]> | undefined {
    if (childGroups == null || childGroups.size === 0) return undefined;

    const result = new Map<string, VirtualWidget[]>();

    for (const [key, childrenData] of childGroups.entries()) {
        const widgets = childrenData
            .map((data) => {
                // Only create widgets from VWNodeData (not VWStateData or VWComponentData)
                if (data instanceof VWNodeData) {
                    return VirtualWidgetRegistry.create(data, parent);
                }
                return null;
            })
            .filter((widget): widget is VirtualWidget => widget !== null);

        result.set(key, widgets);
    }

    return result;
}

/**
 * Builder function for creating VWText widgets from VWNodeData.
 * 
 * @param data - The widget node data
 * @param parent - Optional parent widget
 * @param registry - The widget registry (unused but required by signature)
 * @returns VWText instance
 */
export function textBuilder(
    data: VWNodeData,
    parent: VirtualWidget | undefined,
    registry: any
): VWText {
    return new VWText({
        props: TextPropsClass.fromJson(data.props.value),
        commonProps: data.commonProps,
        parentProps: data.parentProps.value,
        parent: parent,
        refName: data.refName,
    });
}
