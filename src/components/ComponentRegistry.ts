import React from 'react';
import { WidgetNode } from '../config/types';
import { ContainerComponent } from './primitives/Container';
import { TextComponent } from './primitives/Text';
import { ButtonComponent } from './primitives/Button';
import { ImageComponent } from './primitives/Image';

/**
 * Component registry
 * Maps widget type strings to React components
 */
export class ComponentRegistry {
  private components: Map<string, React.ComponentType<any>> = new Map();

  constructor() {
    this.registerDefaultComponents();
  }

  /**
   * Register default/built-in components
   */
  private registerDefaultComponents(): void {
    // Basic components
    this.register('Container', ContainerComponent);
    this.register('Text', TextComponent);
    this.register('Button', ButtonComponent);
    this.register('Image', ImageComponent);
    
    // Add more as needed:
    // this.register('Row', RowComponent);
    // this.register('Column', ColumnComponent);
  }

  /**
   * Register a custom component
   */
  register(type: string, component: React.ComponentType<any>): void {
    this.components.set(type, component);
  }

  /**
   * Get component by type
   */
  get(type: string): React.ComponentType<any> | undefined {
    return this.components.get(type);
  }

  /**
   * Check if component exists
   */
  has(type: string): boolean {
    return this.components.has(type);
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();
