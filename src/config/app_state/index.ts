/**
 * Application state management for expression evaluation.
 * 
 * This module provides reactive state management integration with the
 * expression evaluation system.
 */

export { ReactiveValue } from './reactive_value';
export { PersistedReactiveValue } from './persisted_reactive_value';
export { AppStateScopeContext } from './app_state_scope_context';
export { StateDescriptor, StateDescriptorParser, StateDescriptorFactory } from './state_descriptor_parser';
export { ReactiveValueFactory, DefaultReactiveValueFactory, createReactiveValueFactory } from './reactive_value_factory';
export { DUIAppState, getAppState } from './global_state';
