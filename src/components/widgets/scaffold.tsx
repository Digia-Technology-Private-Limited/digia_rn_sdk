import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Animated,
    Text,
    ScrollView,
    StatusBar,
    Platform,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Drawer } from 'react-native-drawer-layout';
import { VirtualStatelessWidget } from '../base/VirtualStatelessWidget';
import { VirtualWidget } from '../base/VirtualWidget';
import { RenderPayload } from '../../framework/render_payload';
import { VWAppBar } from './AppBar';
import { VWSafeArea } from './SafeArea';
import { VirtualWidgetArrayExtensions } from '../base/extensions';
import { CommonProps } from '../../framework/models/common_props';
import { Props } from '../../framework/models/props';
import { ScaffoldProps } from '../widget_props/scafold_props';

// Types
interface CollapsibleAppBarProps {
    expandedHeight: number;
    collapsedHeight: number;
    pinned: boolean;
    floating: boolean;
    snap: boolean;
    backgroundColor?: string;
    elevation?: number;
    shadowColor?: string;
}



// Context

import { InheritedScaffoldController } from '../internals/inherited_scaffold_controller';


export class VWScaffold extends VirtualStatelessWidget<ScaffoldProps> {
    constructor(options: {
        props: ScaffoldProps;
        commonProps?: CommonProps;
        parentProps?: Props;
        parent?: VirtualWidget;
        childGroups?: Map<string, VirtualWidget[]>;
        refName?: string;
    }) {
        super(options as any);
    }

    render(payload: RenderPayload): React.ReactNode {
        const appBarWidget = this.childOf('appBar');
        const bodyWidget = this.childOf('body');
        const drawerWidget = this.childOf('drawer');
        const endDrawerWidget = this.childOf('endDrawer');
        const bottomNavBarWidget = this.childOf('bottomNavigationBar');
        const footerButtons = this.childrenOf('persistentFooterButtons');

        const bgColor = payload.evalColorExpr(this.props.scaffoldBackgroundColor) ?? undefined;
        const enableSafeArea = payload.evalExpr<boolean>(this.props.enableSafeArea) ?? true;
        const resizeToAvoidBottomInset = payload.evalExpr<boolean>(this.props.resizeToAvoidBottomInset) ?? true;

        const isCollapsibleAppBar = this._isCollapsibleAppBar(appBarWidget, payload);

        console.log('VWScaffold rendering:', {
            hasAppBar: !!appBarWidget,
            hasBody: !!bodyWidget,
            hasBottomNav: !!bottomNavBarWidget,
            isCollapsibleAppBar,
            enableSafeArea
        });

        // Handle bottom navigation
        if (bottomNavBarWidget) {
            return this._renderWithBottomNavigation(
                payload,
                appBarWidget,
                bodyWidget,
                drawerWidget,
                endDrawerWidget,
                bottomNavBarWidget,
                footerButtons,
                bgColor,
                enableSafeArea,
                resizeToAvoidBottomInset,
                isCollapsibleAppBar
            );
        }

        // Handle collapsible app bar
        if (isCollapsibleAppBar && appBarWidget) {
            return this._renderWithCollapsibleAppBar(
                payload,
                appBarWidget,
                bodyWidget,
                drawerWidget,
                endDrawerWidget,
                footerButtons,
                bgColor,
                enableSafeArea,
                resizeToAvoidBottomInset
            );
        }

        // Basic scaffold
        return this._renderBasicScaffold(
            payload,
            appBarWidget,
            bodyWidget,
            drawerWidget,
            endDrawerWidget,
            footerButtons,
            bgColor,
            enableSafeArea,
            resizeToAvoidBottomInset
        );
    }

    // ========== BASIC SCAFFOLD ==========
    private _renderBasicScaffold(
        payload: RenderPayload,
        appBarWidget: VirtualWidget | undefined,
        bodyWidget: VirtualWidget | undefined,
        drawerWidget: VirtualWidget | undefined,
        endDrawerWidget: VirtualWidget | undefined,
        footerButtons: VirtualWidget[] | undefined,
        bgColor: string | undefined,
        enableSafeArea: boolean,
        resizeToAvoidBottomInset: boolean
    ): React.ReactNode {
        const BasicScaffold: React.FC = () => {
            const [drawerOpen, setDrawerOpen] = useState(false);
            const [endDrawerOpen, setEndDrawerOpen] = useState(false);

            const renderAppBar = () => {
                if (!appBarWidget) return null;

                const appBarProps = this._extractAppBarProps(appBarWidget, payload);
                const isVisible = appBarProps.visibility ?? true;

                if (!isVisible) return null;

                return React.cloneElement(appBarWidget.toWidget(payload) as React.ReactElement, {
                    onMenuPress: drawerWidget ? () => setDrawerOpen(true) : undefined,
                    onEndMenuPress: endDrawerWidget ? () => setEndDrawerOpen(true) : undefined,
                });
            };

            const renderBody = () => {
                const bodyContent = bodyWidget ? bodyWidget.toWidget(payload) : <View style={{ flex: 1 }} />;

                // Development-time debug hints: when running in React Native
                // dev mode, add a faint background and log the body widget
                // shape so it's easier to see whether the body is rendered
                // but invisible due to styling.
                const debugStyle = { backgroundColor: 'rgba(255,0,0,0.03)', borderWidth: 0.5, borderColor: 'rgba(255,0,0,0.06)' }
                    ;
                try {
                    // Log basic inspection info to help debug invisible body
                    console.log('VWScaffold: bodyWidget ->', {
                        hasBodyWidget: !!bodyWidget,
                        bodyWidgetType: (bodyWidget as any)?.constructor?.name,
                        bodyContentType: (bodyContent as any)?.type || typeof bodyContent,
                    });
                } catch (e) {
                    // swallow
                }


                const content = enableSafeArea ? (
                    <SafeAreaView style={{ flex: 1 }}>
                        {bodyContent}
                    </SafeAreaView>
                ) : bodyContent;

                // Handle resize to avoid bottom inset
                if (resizeToAvoidBottomInset) {
                    return (
                        <View style={{ flex: 1, marginBottom: Platform.OS === 'ios' ? 0 : 0 }}>
                            {content}
                        </View>
                    );
                }

                // Ensure the body always fills available space. If the
                // child widget doesn't specify flex, it can render with
                // zero height inside a flex parent; wrap it to guarantee
                // visible content.
                return (
                    <View style={[{ flex: 1 }, debugStyle]}>
                        {content}
                    </View>
                );
            };

            const renderDrawer = () => {
                if (!drawerWidget) return null;
                return drawerWidget.toWidget(payload);
            };

            const renderEndDrawer = () => {
                if (!endDrawerWidget) return null;
                return endDrawerWidget.toWidget(payload);
            };

            const renderFooterButtons = () => {
                if (!footerButtons || footerButtons.length === 0) return null;

                const footerContent = VirtualWidgetArrayExtensions.toWidgetArray(footerButtons, payload);

                return (
                    <View style={styles.footerButtons}>
                        {footerContent}
                    </View>
                );
            };

            // With both drawers
            if (drawerWidget && endDrawerWidget) {
                return (
                    <SafeAreaProvider>
                        <View style={[styles.scaffold, { backgroundColor: bgColor }]}>
                            {renderAppBar()}
                            <Drawer
                                open={drawerOpen}
                                onOpen={() => setDrawerOpen(true)}
                                onClose={() => setDrawerOpen(false)}
                                renderDrawerContent={() => renderDrawer()}
                                drawerPosition="left"
                            >
                                <Drawer
                                    open={endDrawerOpen}
                                    onOpen={() => setEndDrawerOpen(true)}
                                    onClose={() => setEndDrawerOpen(false)}
                                    renderDrawerContent={() => renderEndDrawer()}
                                    drawerPosition="right"
                                >
                                    {renderBody()}
                                    {renderFooterButtons()}
                                </Drawer>
                            </Drawer>
                        </View>
                    </SafeAreaProvider>
                );
            }

            // With left drawer only
            if (drawerWidget) {
                return (
                    <SafeAreaProvider>
                        <View style={[styles.scaffold, { backgroundColor: bgColor }]}>
                            {renderAppBar()}
                            <Drawer
                                open={drawerOpen}
                                onOpen={() => setDrawerOpen(true)}
                                onClose={() => setDrawerOpen(false)}
                                renderDrawerContent={() => renderDrawer()}
                                drawerPosition="left"
                            >
                                {renderBody()}
                                {renderFooterButtons()}
                            </Drawer>
                        </View>
                    </SafeAreaProvider>
                );
            }

            // With right drawer only
            if (endDrawerWidget) {
                return (
                    <SafeAreaProvider>
                        <View style={[styles.scaffold, { backgroundColor: bgColor }]}>
                            {renderAppBar()}
                            <Drawer
                                open={endDrawerOpen}
                                onOpen={() => setEndDrawerOpen(true)}
                                onClose={() => setEndDrawerOpen(false)}
                                renderDrawerContent={() => renderEndDrawer()}
                                drawerPosition="right"
                            >
                                {renderBody()}
                                {renderFooterButtons()}
                            </Drawer>
                        </View>
                    </SafeAreaProvider>
                );
            }

            // No drawers
            return (
                <View style={[styles.scaffold, { backgroundColor: bgColor }]}>
                    {renderAppBar()}
                    {<View style={{ flex: 1 }}>
                        {renderBody()}
                    </View>}
                    {renderFooterButtons()}
                </View>
            );
        };

        return <BasicScaffold />;
    }

    // ========== COLLAPSIBLE APP BAR ==========
    private _renderWithCollapsibleAppBar(
        payload: RenderPayload,
        appBarWidget: VirtualWidget,
        bodyWidget: VirtualWidget | undefined,
        drawerWidget: VirtualWidget | undefined,
        endDrawerWidget: VirtualWidget | undefined,
        footerButtons: VirtualWidget[] | undefined,
        bgColor: string | undefined,
        enableSafeArea: boolean,
        resizeToAvoidBottomInset: boolean
    ): React.ReactNode {
        const CollapsibleScaffold: React.FC = () => {
            const scrollY = useRef(new Animated.Value(0)).current;
            const [expandedHeight, setExpandedHeight] = useState(200);
            const [collapsedHeight, setCollapsedHeight] = useState(80);
            const [isAppBarCollapsed, setIsAppBarCollapsed] = useState(false);

            const appBarProps = this._extractAppBarProps(appBarWidget, payload);
            const actualExpandedHeight = appBarProps.expandedHeight || expandedHeight;
            const actualCollapsedHeight = appBarProps.collapsedHeight || collapsedHeight;

            // Update collapse state based on scroll
            useEffect(() => {
                const listener = scrollY.addListener(({ value }) => {
                    const collapsed = value > (actualExpandedHeight - actualCollapsedHeight) / 2;
                    setIsAppBarCollapsed(collapsed);
                });

                return () => scrollY.removeListener(listener);
            }, [actualExpandedHeight, actualCollapsedHeight]);

            const renderExpandedHeader = () => (
                <Animated.View
                    onLayout={(event) => setExpandedHeight(event.nativeEvent.layout.height)}
                    style={{
                        transform: [
                            {
                                translateY: scrollY.interpolate({
                                    inputRange: [0, actualExpandedHeight - actualCollapsedHeight],
                                    outputRange: [0, -(actualExpandedHeight - actualCollapsedHeight)],
                                    extrapolate: 'clamp',
                                }),
                            },
                        ],
                        opacity: scrollY.interpolate({
                            inputRange: [0, actualExpandedHeight - actualCollapsedHeight - 50],
                            outputRange: [1, 0],
                            extrapolate: 'clamp',
                        }),
                    }}
                >
                    {appBarWidget.toWidget(payload)}
                </Animated.View>
            );

            const renderCollapsedHeader = () => (
                <Animated.View
                    style={[
                        styles.collapsedHeader,
                        {
                            backgroundColor: appBarProps.backgroundColor,
                            height: actualCollapsedHeight,
                            transform: [
                                {
                                    translateY: scrollY.interpolate({
                                        inputRange: [0, actualExpandedHeight - actualCollapsedHeight],
                                        outputRange: [actualExpandedHeight - actualCollapsedHeight, 0],
                                        extrapolate: 'clamp',
                                    }),
                                },
                            ],
                            opacity: scrollY.interpolate({
                                inputRange: [0, actualExpandedHeight - actualCollapsedHeight - 30],
                                outputRange: [0, 1],
                                extrapolate: 'clamp',
                            }),
                            elevation: appBarProps.elevation || 4,
                            shadowColor: appBarProps.shadowColor || '#000',
                        },
                    ]}
                >
                    {this._renderCollapsedHeaderContent(appBarWidget, payload)}
                </Animated.View>
            );

            const renderBody = () => {
                const bodyContent = bodyWidget ? bodyWidget.toWidget(payload) : <View style={{ height: 1000 }} />;

                const scrollView = (
                    <Animated.ScrollView
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            { useNativeDriver: true }
                        )}
                        contentContainerStyle={{ paddingTop: actualExpandedHeight }}
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {bodyContent}
                    </Animated.ScrollView>
                );

                return enableSafeArea ? (
                    <SafeAreaView style={{ flex: 1 }}>
                        {scrollView}
                    </SafeAreaView>
                ) : scrollView;
            };

            const renderFooterButtons = () => {
                if (!footerButtons || footerButtons.length === 0) return null;

                const footerContent = VirtualWidgetArrayExtensions.toWidgetArray(footerButtons, payload);

                return (
                    <View style={[styles.footerButtons, { bottom: resizeToAvoidBottomInset ? 0 : 'auto' }]}>
                        {footerContent}
                    </View>
                );
            };

            return (
                <InheritedScaffoldController
                    currentIndex={0}
                    setCurrentIndex={() => { }}
                >
                    <SafeAreaProvider>
                        <View style={[styles.scaffold, { backgroundColor: bgColor }]}>
                            {renderExpandedHeader()}
                            {appBarProps.pinned !== false && renderCollapsedHeader()}
                            {renderBody()}
                            {renderFooterButtons()}
                        </View>
                    </SafeAreaProvider>
                </InheritedScaffoldController>
            );
        };

        return <CollapsibleScaffold />;
    }

    // ========== BOTTOM NAVIGATION ==========
    private _renderWithBottomNavigation(
        payload: RenderPayload,
        appBarWidget: VirtualWidget | undefined,
        bodyWidget: VirtualWidget | undefined,
        drawerWidget: VirtualWidget | undefined,
        endDrawerWidget: VirtualWidget | undefined,
        bottomNavBarWidget: VirtualWidget,
        footerButtons: VirtualWidget[] | undefined,
        bgColor: string | undefined,
        enableSafeArea: boolean,
        resizeToAvoidBottomInset: boolean,
        isCollapsibleAppBar: boolean
    ): React.ReactNode {
        const ScaffoldWithBottomNav: React.FC = () => {
            const [currentIndex, setCurrentIndex] = useState(0);
            const scrollY = useRef(new Animated.Value(0)).current;

            const Tab = createBottomTabNavigator();

            const renderTabScreens = () => {
                const navItems = this._extractNavItems(bottomNavBarWidget);

                return navItems.map((item, index) => (
                    <Tab.Screen
                        key={item.id || index}
                        name={item.label || `Tab${index}`}
                        component={() => this._renderTabContent(payload, item, enableSafeArea)}
                    />
                ));
            };

            const renderAppBar = () => {
                if (!appBarWidget) return null;

                if (isCollapsibleAppBar) {
                    // For collapsible app bar with bottom nav, use simplified version
                    return this._renderSimplifiedCollapsibleAppBar(appBarWidget, payload, scrollY);
                }

                const appBarProps = this._extractAppBarProps(appBarWidget, payload);
                const isVisible = appBarProps.visibility ?? true;

                if (!isVisible) return null;

                return React.cloneElement(appBarWidget.toWidget(payload) as React.ReactElement, {
                    onMenuPress: drawerWidget ? () => { } : undefined,
                    onEndMenuPress: endDrawerWidget ? () => { } : undefined,
                });
            };

            const renderFooterButtons = () => {
                if (!footerButtons || footerButtons.length === 0) return null;

                const footerContent = VirtualWidgetArrayExtensions.toWidgetArray(footerButtons, payload);

                return (
                    <View style={styles.footerButtons}>
                        {footerContent}
                    </View>
                );
            };

            return (
                <InheritedScaffoldController
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                >
                    <SafeAreaProvider>
                        <NavigationContainer>
                            <View style={[styles.scaffold, { backgroundColor: bgColor }]}>
                                {renderAppBar()}
                                <Tab.Navigator
                                    screenOptions={{
                                        headerShown: false,
                                        tabBarStyle: [
                                            styles.bottomNavBar,
                                            {
                                                display: resizeToAvoidBottomInset ? 'flex' : 'none',
                                            },
                                        ],
                                    }}
                                    sceneContainerStyle={{ backgroundColor: bgColor }}
                                >
                                    {renderTabScreens()}
                                </Tab.Navigator>
                                {renderFooterButtons()}
                            </View>
                        </NavigationContainer>
                    </SafeAreaProvider>
                </InheritedScaffoldController>
            );
        };

        return <ScaffoldWithBottomNav />;
    }

    // ========== HELPER METHODS ==========
    private _isCollapsibleAppBar(appBarWidget: VirtualWidget | undefined, payload: RenderPayload): boolean {
        if (!appBarWidget || !(appBarWidget instanceof VWAppBar)) return false;

        const enableCollapsible = payload.evalExpr(appBarWidget.props.enableCollapsibleAppBar);
        const expandedHeight = payload.evalExpr(appBarWidget.props.expandedHeight);

        return !!(enableCollapsible && expandedHeight);
    }

    private _extractAppBarProps(appBarWidget: VirtualWidget, payload: RenderPayload): any {
        if (appBarWidget instanceof VWAppBar) {
            return {
                backgroundColor: payload.evalColorExpr(appBarWidget.props.backgroundColor),
                collapsedHeight: payload.evalExpr(appBarWidget.props.collapsedHeight) || 80,
                expandedHeight: payload.evalExpr(appBarWidget.props.expandedHeight) || 200,
                pinned: payload.evalExpr(appBarWidget.props.pinned) ?? true,
                floating: payload.evalExpr(appBarWidget.props.floating) ?? false,
                snap: payload.evalExpr(appBarWidget.props.snap) ?? false,
                elevation: payload.evalExpr(appBarWidget.props.elevation) || 4,
                shadowColor: payload.evalColorExpr(appBarWidget.props.shadowColor) || '#000',
                visibility: payload.evalExpr(appBarWidget.props.visibility) ?? true,
                title: appBarWidget.props.title,
            };
        }
        return {};
    }

    private _renderCollapsedHeaderContent(appBarWidget: VirtualWidget, payload: RenderPayload): React.ReactNode {
        if (appBarWidget instanceof VWAppBar) {
            const title = appBarWidget.props.title;
            const titleText = title ? payload.evalExpr(title.text) : '';

            return (
                <View style={styles.collapsedHeaderContent}>
                    <View style={styles.collapsedTitle}>
                        {titleText ? (
                            <Text style={styles.collapsedTitleText} numberOfLines={1}>
                                {titleText}
                            </Text>
                        ) : null}
                    </View>
                    {this._renderCollapsedActions(appBarWidget, payload)}
                </View>
            );
        }
        return null;
    }

    private _renderCollapsedActions(appBarWidget: VirtualWidget, payload: RenderPayload): React.ReactNode {
        if (!(appBarWidget instanceof VWAppBar)) return null;

        // Render only essential actions in collapsed state
        const actions = (appBarWidget as any).childrenOf ? (appBarWidget as any).childrenOf('actions') : undefined;
        if (!actions || actions.length === 0) return null;

        const essentialActions = actions.slice(0, 2); // Limit to 2 actions in collapsed state

        return (
            <View style={styles.collapsedActions}>
                {VirtualWidgetArrayExtensions.toWidgetArray(essentialActions, payload)}
            </View>
        );
    }

    private _renderSimplifiedCollapsibleAppBar(
        appBarWidget: VirtualWidget,
        payload: RenderPayload,
        scrollY: Animated.Value
    ): React.ReactNode {
        const SimplifiedCollapsibleAppBar: React.FC = () => {
            const [height] = useState(120);

            return (
                <Animated.View
                    style={{
                        height,
                        transform: [
                            {
                                translateY: scrollY.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, -50],
                                    extrapolate: 'clamp',
                                }),
                            },
                        ],
                        opacity: scrollY.interpolate({
                            inputRange: [0, 80],
                            outputRange: [1, 0],
                            extrapolate: 'clamp',
                        }),
                    }}
                >
                    {appBarWidget.toWidget(payload)}
                </Animated.View>
            );
        };

        return <SimplifiedCollapsibleAppBar />;
    }

    private _extractNavItems(navBarWidget: VirtualWidget): Array<{ id?: string, label?: string, icon?: any, args?: any }> {
        try {
            const children = (navBarWidget as any).childrenOf('children');
            if (children && Array.isArray(children)) {
                return children.map((child: any) => ({
                    id: child.props?.onSelect?.entity?.id,
                    label: child.props?.label,
                    icon: child.props?.icon,
                    args: child.props?.onSelect?.entity?.args,
                }));
            }
        } catch (error) {
            console.warn('Error extracting nav items:', error);
        }

        return [];
    }

    private _renderTabContent(payload: RenderPayload, navItem: any, enableSafeArea: boolean): React.ReactNode {
        try {
            const actionExecutor = (payload.context as any)?.actionExecutor;
            const viewBuilder = actionExecutor?.viewBuilder;

            if (typeof viewBuilder === 'function' && navItem.id) {
                const content = viewBuilder(navItem.id, navItem.args);

                if (enableSafeArea) {
                    return (
                        <SafeAreaView style={{ flex: 1 }}>
                            {content}
                        </SafeAreaView>
                    );
                }
                return content;
            }
        } catch (error) {
            console.warn('Error rendering tab content:', error);
        }

        // Fallback
        return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
    }
}


// Styles
const styles = StyleSheet.create({
    scaffold: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    collapsedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        justifyContent: 'center',
    },
    collapsedHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        flex: 1,
    },
    collapsedTitle: {
        flex: 1,
    },
    collapsedTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    collapsedActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    bottomNavBar: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
});
