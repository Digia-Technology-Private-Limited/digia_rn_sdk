import { DUIConfig } from '../../config/model';
import { APIModel } from '../../network/api_request/api_request';
import { DUIPageDefinition } from '../../framework/models/page_definition';
import { DUIComponentDefinition } from '../../framework/models/component_definition';
import { JsonLike } from '../../framework/utils/types';
import { as$, as } from '../../framework/utils/functional_utils';

/**
 * Abstract interface for providing configuration data to the Digia UI system.
 *
 * ConfigProvider defines the contract for accessing page definitions,
 * component definitions, API models, and routing information. This abstraction
 * allows for different configuration sources and enables testing with mock
 * implementations.
 *
 * The provider is responsible for:
 * - **Page Management**: Retrieving page definitions and determining initial routes
 * - **Component Access**: Providing component definitions for reusable UI blocks
 * - **API Configuration**: Supplying API model configurations for network requests
 * - **Type Resolution**: Determining whether an ID represents a page or component
 *
 * Implementations should handle:
 * - Configuration loading and caching
 * - Error handling for missing definitions
 * - Type validation and conversion
 * - Performance optimization for frequent lookups
 * 
 * @example
 * ```typescript
 * class MyConfigProvider implements ConfigProvider {
 *   getInitialRoute(): string {
 *     return 'home';
 *   }
 *   
 *   getPageDefinition(pageId: string): DUIPageDefinition {
 *     // Load and parse page definition
 *   }
 *   
 *   // ... implement other methods
 * }
 * ```
 */
export abstract class ConfigProvider {
    /**
     * Gets the initial route/page ID that should be displayed when the app starts.
     *
     * Returns the page identifier that serves as the entry point for the application.
     * This is typically configured in the app settings within Digia Studio.
     * 
     * @returns The initial page/route identifier
     */
    abstract getInitialRoute(): string;

    /**
     * Retrieves a page definition by its unique identifier.
     *
     * @param pageId - The unique identifier of the page to retrieve
     * @returns A DUIPageDefinition containing the page structure, state definitions,
     *          argument definitions, and UI hierarchy
     * @throws Error if the page with the given ID is not found
     */
    abstract getPageDefinition(pageId: string): DUIPageDefinition;

    /**
     * Retrieves a component definition by its unique identifier.
     *
     * @param componentId - The unique identifier of the component to retrieve
     * @returns A DUIComponentDefinition containing the component structure,
     *          argument definitions, state definitions, and UI hierarchy
     * @throws Error if the component with the given ID is not found
     */
    abstract getComponentDefinition(componentId: string): DUIComponentDefinition;

    /**
     * Gets all API model configurations available in the project.
     *
     * @returns A map where keys are API model identifiers and values are
     *          APIModel instances containing endpoint configurations, authentication
     *          settings, and request/response specifications
     */
    abstract getAllApiModels(): Record<string, APIModel>;

    /**
     * Determines whether the given identifier represents a page.
     *
     * @param id - The identifier to check
     * @returns true if the ID corresponds to a page definition, false if it
     *          represents a component or doesn't exist
     */
    abstract isPage(id: string): boolean;
}

/**
 * Default implementation of ConfigProvider that uses DUIConfig as the data source.
 *
 * DUIConfigProvider reads configuration data from a DUIConfig instance,
 * which typically contains the complete project configuration loaded from
 * the Digia Studio backend. This is the standard implementation used in
 * production applications.
 *
 * The provider handles:
 * - **JSON Parsing**: Converts raw configuration data to typed objects
 * - **Error Handling**: Provides clear error messages for missing definitions
 * - **Type Safety**: Ensures proper type conversion and validation
 * - **Performance**: Efficient lookups and minimal data transformation
 *
 * @example
 * ```typescript
 * const config = new DUIConfig(configurationData);
 * const provider = new DUIConfigProvider(config);
 *
 * const initialPage = provider.getInitialRoute();
 * const pageDefinition = provider.getPageDefinition('home_page');
 * const apiModels = provider.getAllApiModels();
 * ```
 */
export class DUIConfigProvider implements ConfigProvider {
    /** The configuration instance containing all project data */
    readonly config: DUIConfig;

    /**
     * Creates a new DUIConfigProvider with the specified configuration.
     *
     * @param config - The DUIConfig instance containing project configuration data
     */
    constructor(config: DUIConfig) {
        this.config = config;
    }

    /**
     * Retrieves a page definition by ID from the config.
     * 
     * @param pageId - The page identifier
     * @returns The parsed DUIPageDefinition
     * @throws Error if page definition is not found
     */
    getPageDefinition(pageId: string): DUIPageDefinition {
        // Extract page configuration from DUIConfig
        const pageDef = as$<JsonLike>(this.config.pages[pageId]);

        if (pageDef == null) {
            throw new Error(`Page definition for ${pageId} not found`);
        }

        return DUIPageDefinition.fromJson(pageDef);
    }

    /**
     * Retrieves a component definition by ID from the config.
     * 
     * @param componentId - The component identifier
     * @returns The parsed DUIComponentDefinition
     * @throws Error if component definition is not found
     */
    getComponentDefinition(componentId: string): DUIComponentDefinition {
        // Extract component configuration from DUIConfig
        const componentDef = as$<JsonLike>(this.config.components?.[componentId]);

        if (componentDef == null) {
            throw new Error(`Component definition for ${componentId} not found`);
        }

        return DUIComponentDefinition.fromJson(componentDef);
    }

    /**
     * Gets the initial route configured in DUIConfig.
     * 
     * @returns The initial route/page ID
     */
    getInitialRoute(): string {
        return this.config.initialRoute;
    }

    /**
     * Retrieves all API model configurations from the REST config.
     * 
     * @returns Map of API model ID to APIModel instance
     */
    getAllApiModels(): Record<string, APIModel> {
        // Extract and parse all API model configurations
        const resources = as$<JsonLike>(this.config.restConfig['resources']);

        if (!resources) {
            return {};
        }

        const apiModels: Record<string, APIModel> = {};

        for (const [key, value] of Object.entries(resources)) {
            const resourceJson = as<JsonLike>(value);
            if (resourceJson) {
                apiModels[key] = APIModel.fromJson(resourceJson);
            }
        }

        return apiModels;
    }

    /**
     * Checks if an ID corresponds to a page.
     * 
     * @param id - The identifier to check
     * @returns true if it's a page, false otherwise
     */
    isPage(id: string): boolean {
        return this.config.pages[id] != null;
    }
}
