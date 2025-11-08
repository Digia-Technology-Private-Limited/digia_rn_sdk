import { Logger } from './logger';

/**
 * Abstract interface for file operations.
 * 
 * Note: This requires react-native-fs to be installed in the consuming app.
 * Install with: npm install react-native-fs
 * 
 * Or implement your own FileOperations using any storage solution.
 */
export abstract class FileOperations {
    abstract get localPath(): Promise<string>;
    abstract writeStringToFile(data: string, fileName: string): Promise<boolean>;
    abstract writeBytesToFile(data: Uint8Array | number[], fileName: string): Promise<boolean>;
    abstract readString(fileName: string): Promise<string | null>;
    abstract exists(fileName: string): Promise<boolean>;
    abstract delete(fileName: string): Promise<void>;
    abstract lastModified(fileName: string): Promise<Date>;
}

/**
 * Default implementation of FileOperations using react-native-fs.
 * 
 * IMPORTANT: This class requires react-native-fs to be installed in your app:
 * ```bash
 * npm install react-native-fs
 * cd ios && pod install
 * ```
 * 
 * If you don't want file system dependencies, use a custom implementation
 * or use the SDK's storage system instead.
 */
export class FileOperationsImpl implements FileOperations {
    private RNFS: any = null;

    constructor() {
        try {
            // Dynamically require RNFS to avoid build errors if not installed
            this.RNFS = require('react-native-fs');
        } catch (e) {
            Logger.warning(
                'react-native-fs not found. File operations will not work. Install with: npm install react-native-fs',
                'FileOperations'
            );
        }
    }

    get localPath(): Promise<string> {
        if (!this.RNFS) {
            throw new Error('react-native-fs is not installed');
        }
        return Promise.resolve(this.RNFS.DocumentDirectoryPath);
    }

    async writeStringToFile(data: string, fileName: string): Promise<boolean> {
        if (!this.RNFS) {
            Logger.error('react-native-fs is not installed', 'FileOperations');
            return false;
        }

        try {
            const path = await this.localPath;
            const filePath = `${path}/${fileName}`;
            await this.RNFS.writeFile(filePath, data, 'utf8');
            Logger.log(`File written successfully to ${filePath}`, 'FileOperations');
            return true;
        } catch (e) {
            Logger.error(`An error occurred: ${e}`, 'FileOperations', e);
            return false;
        }
    }

    async writeBytesToFile(
        data: Uint8Array | number[],
        fileName: string
    ): Promise<boolean> {
        if (!this.RNFS) {
            Logger.error('react-native-fs is not installed', 'FileOperations');
            return false;
        }

        try {
            const path = await this.localPath;
            const filePath = `${path}/${fileName}`;

            // Convert to base64 for react-native-fs
            const base64Data = this.arrayToBase64(data);
            await this.RNFS.writeFile(filePath, base64Data, 'base64');

            Logger.log(`File written successfully to ${filePath}`, 'FileOperations');
            return true;
        } catch (e) {
            Logger.error(`An error occurred: ${e}`, 'FileOperations', e);
            return false;
        }
    }

    async readString(fileName: string): Promise<string | null> {
        if (!this.RNFS) {
            Logger.error('react-native-fs is not installed', 'FileOperations');
            return null;
        }

        try {
            const path = await this.localPath;
            const filePath = `${path}/${fileName}`;
            const content = await this.RNFS.readFile(filePath, 'utf8');
            return content;
        } catch (e) {
            Logger.error(`An error occurred: ${e}`, 'FileOperations', e);
            return null;
        }
    }

    async exists(fileName: string): Promise<boolean> {
        if (!this.RNFS) {
            Logger.error('react-native-fs is not installed', 'FileOperations');
            return false;
        }

        try {
            const path = await this.localPath;
            const filePath = `${path}/${fileName}`;
            const fileExists = await this.RNFS.exists(filePath);
            return fileExists;
        } catch (e) {
            Logger.error(`An error occurred: ${e}`, 'FileOperations', e);
            return false;
        }
    }

    async delete(fileName: string): Promise<void> {
        if (!this.RNFS) {
            throw new Error('react-native-fs is not installed');
        }

        const path = await this.localPath;
        const filePath = `${path}/${fileName}`;

        if (await this.exists(fileName)) {
            await this.RNFS.unlink(filePath);
        }
    }

    async lastModified(fileName: string): Promise<Date> {
        if (!this.RNFS) {
            throw new Error('react-native-fs is not installed');
        }

        const path = await this.localPath;
        const filePath = `${path}/${fileName}`;
        const stat = await this.RNFS.stat(filePath);
        return new Date(stat.mtime);
    }

    /**
     * Helper method to convert byte array to base64
     */
    private arrayToBase64(data: Uint8Array | number[]): string {
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

/**
 * Creates a FileOperations instance.
 * Returns null if react-native-fs is not available.
 */
export function createFileOperations(): FileOperations | null {
    try {
        return new FileOperationsImpl();
    } catch (e) {
        Logger.warning(
            'FileOperations not available. Install react-native-fs if you need file system access.',
            'FileOperations'
        );
        return null;
    }
}
