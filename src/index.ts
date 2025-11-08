/**
 * Digia React Native SDK
 * 
 * Main entry point for the SDK exports.
 */

// Core initialization
export { DigiaUI } from './init/digia_ui';
export { DigiaUIManager, getDigiaUIManager } from './init/digia_ui_manager';

// Configuration
export * from './dui_config';
export { ConfigResolver } from './config/ConfigResolver';
export { DUIConfig } from './config/model';

// Storage
export { storage, type StorageAdapter } from './storage/storage';
export { PreferencesStore, getPreferencesStore } from './preferences_store';

// Network
export { NetworkClient } from './network/network_client';

// App State Management
export * from './config/app_state';

// Analytics
export * from './analytics';

// Framework utilities
export * from './framework/utils';
export {
  MessageBus,
  Message,
  DigiaUIScope,
  useDigiaUIScope,
  useMessageBus,
  useAnalytics,
} from './framework';

// Data types
export * from './framework/data_type/data_type';
export { Variable } from './framework/data_type/variable';

// Framework types
export * from './framework/types';

// Base widget classes
export * from './components/base';

// Components
export { ComponentRegistry } from './components/ComponentRegistry';
export { ContainerComponent } from './components/primitives/Container';
export { TextComponent } from './components/primitives/Text';
export { ButtonComponent } from './components/primitives/Button';
export { ImageComponent } from './components/primitives/Image';

// Actions
export { ActionExecutor } from './actions/ActionExecutor';
export * from './actions/processors';
