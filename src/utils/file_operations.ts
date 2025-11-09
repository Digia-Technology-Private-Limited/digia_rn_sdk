import { Logger } from './logger';

/**
 * Abstract interface for file operations.
 * 
 * Provides file system operations like reading, writing, deleting files.
 * Implementations should handle platform-specific file operations.
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
 */
export class FileOperationsImpl implements FileOperations {
    private RNFS: any = null;
    private initialized: boolean = false;

    constructor() {
        try {
            // Dynamically require RNFS to avoid build errors if not installed
            this.RNFS = require('react-native-fs');

            // Verify RNFS is properly initialized (has native modules)
            if (this.RNFS && this.RNFS.DocumentDirectoryPath) {
                this.initialized = true;
            } else {
                Logger.warning(
                    'react-native-fs is not properly linked. The consuming app needs to install it and rebuild.',
                    'FileOperations'
                );
            }
        } catch (e) {
            Logger.warning(
                'react-native-fs not found. The consuming app must install it: npm install react-native-fs',
                'FileOperations'
            );
        }
    }

    get localPath(): Promise<string> {
        if (!this.initialized || !this.RNFS) {
            throw new Error('react-native-fs is not installed or not properly linked');
        }
        return Promise.resolve(this.RNFS.DocumentDirectoryPath);
    }

    async writeStringToFile(data: string, fileName: string): Promise<boolean> {
        if (!this.initialized || !this.RNFS) {
            Logger.error('react-native-fs is not installed or not properly linked', 'FileOperations');
            return false;
        }

        try {
            const path = await this.localPath;
            const filePath = `${path}/${fileName}`;
            await this.RNFS.writeFile(filePath, data, 'utf8');
            Logger.log(`File written successfully to ${filePath}`, 'FileOperations');
            return true;
        } catch (e) {
            Logger.error(`An error occurred: ${e}`, 'FileOperations');
            return false;
        }
    }

    async writeBytesToFile(
        data: Uint8Array | number[],
        fileName: string
    ): Promise<boolean> {
        if (!this.initialized || !this.RNFS) {
            Logger.error('react-native-fs is not installed or not properly linked', 'FileOperations');
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
            Logger.error(`An error occurred: ${e}`, 'FileOperations');
            return false;
        }
    }

    async readString(fileName: string): Promise<string | null> {
        if (!this.initialized || !this.RNFS) {
            Logger.error('react-native-fs is not installed or not properly linked', 'FileOperations');
            return null;
        }

        try {
            const path = await this.localPath;
            const filePath = `${path}/${fileName}`;
            const content = await this.RNFS.readFile(filePath, 'utf8');
            return content;
        } catch (e) {
            Logger.error(`An error occurred: ${e}`, 'FileOperations');
            return null;
        }
    }

    async exists(fileName: string): Promise<boolean> {
        if (!this.initialized || !this.RNFS) {
            Logger.error('react-native-fs is not installed or not properly linked', 'FileOperations');
            return false;
        }

        try {
            const path = await this.localPath;
            const filePath = `${path}/${fileName}`;
            const fileExists = await this.RNFS.exists(filePath);
            return fileExists;
        } catch (e) {
            Logger.error(`An error occurred: ${e}`, 'FileOperations');
            return false;
        }
    }

    async delete(fileName: string): Promise<void> {
        if (!this.initialized || !this.RNFS) {
            throw new Error('react-native-fs is not installed or not properly linked');
        }

        const path = await this.localPath;
        const filePath = `${path}/${fileName}`;

        if (await this.exists(fileName)) {
            await this.RNFS.unlink(filePath);
        }
    }

    async lastModified(fileName: string): Promise<Date> {
        if (!this.initialized || !this.RNFS) {
            throw new Error('react-native-fs is not installed or not properly linked');
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
