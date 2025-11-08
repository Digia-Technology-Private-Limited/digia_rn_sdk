/// Represents the target environment for the Digia UI SDK.
///
/// Environments determine which backend services and configuration
/// the SDK connects to. Common environments include local, development, and production.
export class Environment {
    /// The name of this environment.
    readonly name: string;

    /// Creates an environment with the specified name (for predefined environments).
    private constructor(name: string) {
        this.name = name;
    }

    /// Creates a custom environment with the specified name.
    static custom(name: string): Environment {
        return new Environment(name);
    }

    /// Local development environment.
    static readonly local = new Environment('local');

    /// Development/testing environment.
    static readonly development = new Environment('development');

    /// Production environment.
    static readonly production = new Environment('production');

    /// Returns the environment name as a string.
    toString(): string {
        return this.name;
    }

    /// Creates an Environment from a string name.
    ///
    /// Returns predefined environments for 'local', 'development', and 'production'.
    /// For other names, creates a custom environment.
    static fromString(name: string): Environment {
        switch (name.toLowerCase()) {
            case 'local':
                return Environment.local;
            case 'development':
                return Environment.development;
            case 'production':
                return Environment.production;
            default:
                return Environment.custom(name);
        }
    }

    /// Checks equality based on environment name.
    equals(other: Environment): boolean {
        return this.name === other.name;
    }
}