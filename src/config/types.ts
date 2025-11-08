// /**
//  * Core configuration types for Digia SDK
//  * Maps to Flutter's DUIConfig model
//  */

// export interface DUIConfig {
//   pages: Record<string, PageDefinition>;
//   components?: Record<string, ComponentDefinition>;
//   theme: ThemeConfig;
//   rest: RestConfig;
//   appSettings: AppSettings;
//   appState?: StateDescriptor[];
//   version?: number;
//   versionUpdated?: boolean;
//   environment?: Record<string, any>;
//   functionsFilePath?: string;
// }

// export interface PageDefinition {
//   uid: string;
//   pageId: string;
//   layout: {
//     root?: WidgetNode;
//   };
//   actions?: {
//     onPageLoad?: ActionFlow;
//     onBackPress?: ActionFlow;
//   };
//   pageArgDefs?: Record<string, Variable>;
//   initStateDefs?: Record<string, Variable>;
// }

// export interface ComponentDefinition {
//   uid: string;
//   id: string;
//   layout: {
//     root?: WidgetNode;
//   };
//   argDefs?: Record<string, Variable>;
//   initStateDefs?: Record<string, Variable>;
// }

// export interface WidgetNode {
//   type: string;
//   category?: 'widget' | 'component' | 'state';
//   props?: Record<string, any>;
//   commonProps?: CommonProps;
//   children?: Record<string, WidgetNode[]>;
//   refName?: string;
//   repeatData?: RepeatData;
// }

// export interface CommonProps {
//   visible?: ExprOr<boolean>;
//   margin?: EdgeInsets;
//   padding?: EdgeInsets;
//   width?: ExprOr<number>;
//   height?: ExprOr<number>;
//   alignment?: string;
//   decoration?: BoxDecoration;
// }

// export interface EdgeInsets {
//   top?: number;
//   bottom?: number;
//   left?: number;
//   right?: number;
//   all?: number;
// }

// export interface BoxDecoration {
//   color?: string;
//   borderRadius?: number;
//   border?: BorderConfig;
//   boxShadow?: ShadowConfig[];
// }

// export interface BorderConfig {
//   color?: string;
//   width?: number;
// }

// export interface ShadowConfig {
//   color?: string;
//   blurRadius?: number;
//   spreadRadius?: number;
//   offset?: { x: number; y: number };
// }

// export interface RepeatData {
//   dataSource: ExprOr<any[]>;
//   itemName?: string;
//   indexName?: string;
// }

// export interface Variable {
//   type: string;
//   name: string;
//   value?: any;
//   defaultValue?: any;
// }

// export interface ThemeConfig {
//   colors?: Record<string, string>;
//   textStyles?: Record<string, TextStyle>;
//   fonts?: FontConfig[];
// }

// export interface TextStyle {
//   fontSize?: number;
//   fontWeight?: string;
//   color?: string;
//   fontFamily?: string;
//   letterSpacing?: number;
//   lineHeight?: number;
// }

// export interface FontConfig {
//   family: string;
//   fonts: Array<{
//     asset: string;
//     weight?: string;
//     style?: string;
//   }>;
// }

// export interface RestConfig {
//   baseUrl?: string;
//   resources?: Record<string, APIModel>;
//   headers?: Record<string, string>;
// }

// export interface APIModel {
//   endpoint: string;
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
//   headers?: Record<string, string>;
//   queryParams?: Record<string, any>;
//   body?: any;
//   auth?: AuthConfig;
// }

// export interface AuthConfig {
//   type: 'bearer' | 'basic' | 'apiKey';
//   token?: string;
//   key?: string;
//   value?: string;
// }

// export interface AppSettings {
//   initialRoute: string;
//   name?: string;
//   version?: string;
// }

// export interface StateDescriptor {
//   type: 'string' | 'number' | 'bool' | 'json' | 'list';
//   name: string;
//   value: any;
//   shouldPersist?: boolean;
//   streamName?: string;
// }

// /**
//  * Expression or direct value wrapper
//  * Mirrors Flutter's ExprOr<T>
//  */
// export type ExprOr<T> = T | { expr: string } | string;

// /**
//  * Action flow definition
//  * Mirrors Flutter's ActionFlow
//  */
// export interface ActionFlow {
//   steps: Action[];
//   inkwell?: boolean;
//   analyticsData?: any[];
// }

// /**
//  * Base action interface
//  */
// export interface Action {
//   type: string;
//   data: Record<string, any>;
//   disableActionIf?: ExprOr<boolean>;
// }
