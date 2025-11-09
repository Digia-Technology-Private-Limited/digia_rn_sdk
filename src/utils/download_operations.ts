import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { FileOperations, FileOperationsImpl } from './file_operations';
import { Logger } from './logger';

/**
 * Abstract interface for file downloading operations.
 */
export abstract class FileDownloader {
    /**
     * Download a file from a URL and optionally save it to local storage.
     * 
     * @param url - The URL to download from
     * @param fileName - The name to save the file as
     * @param retry - Current retry count (internal use)
     * @returns The axios response or null if failed
     */
    abstract downloadFile(
        url: string,
        fileName: string,
        options?: { retry?: number }
    ): Promise<AxiosResponse<ArrayBuffer> | null>;
}

/**
 * Default implementation of FileDownloader using axios.
 * Downloads files and optionally saves them to local storage on native platforms.
 */
export class FileDownloaderImpl implements FileDownloader {
    private fileOps: FileOperations | null;
    private client: AxiosInstance;

    /**
     * Creates a new FileDownloaderImpl instance.
     * 
     * @param options - Configuration options
     * @param options.fileOps - File operations instance (optional, uses default if not provided)
     * @param options.client - Axios instance (optional, creates default if not provided)
     */
    constructor(options?: {
        fileOps?: FileOperations;
        client?: AxiosInstance;
    }) {
        this.fileOps = options?.fileOps ?? new FileOperationsImpl();
        this.client = options?.client ?? axios.create({
            timeout: 30000,
            responseType: 'arraybuffer',
        });
    }

    async downloadFile(
        url: string,
        fileName: string,
        options?: { retry?: number }
    ): Promise<AxiosResponse<ArrayBuffer> | null> {
        const retry = options?.retry ?? 0;

        // Validate URL is not empty
        if (!url || url.trim() === '') {
            // Logger.error(
            //     `Cannot download file: URL is empty for file "${fileName}"`,
            //     'FileDownloader'
            // );
            return null;
        }

        console.log('Download attempt:', url, 'for file:', fileName);
        try {
            // Send GET request to download the file
            const response = await this.client.get<ArrayBuffer>(url, {
                timeout: 5000,
                responseType: 'arraybuffer',
            });

            if (response.status === 200) {
                // Write the response to a file on native platforms
                if (Platform.OS !== 'web' && this.fileOps) {
                    const data = new Uint8Array(response.data);
                    const success = await this.fileOps.writeBytesToFile(data, fileName);

                    if (!success) {
                        Logger.error(`Failed to write file: ${fileName}`, 'FileDownloader');
                        return await this._retryFileDownload(url, fileName, retry);
                    }
                }

                return response;
            } else {
                Logger.error(
                    `Failed to download file: ${response.status}`,
                    'FileDownloader'
                );
                return await this._retryFileDownload(url, fileName, retry);
            }
        } catch (e) {
            Logger.error(`An error occurred: ${e}`, 'FileDownloader', e);
            return await this._retryFileDownload(url, fileName, retry);
        }
    }

    /**
     * Retry file download up to 2 times (3 total attempts).
     * 
     * @param url - The URL to download from
     * @param fileName - The name to save the file as
     * @param retry - Current retry count
     * @returns The axios response or null if all retries failed
     */
    private async _retryFileDownload(
        url: string,
        fileName: string,
        retry: number
    ): Promise<AxiosResponse<ArrayBuffer> | null> {
        if (retry < 2) {
            return await this.downloadFile(url, fileName, { retry: retry + 1 });
        } else {
            Logger.error(
                `3 retries done.. ${fileName} fetch failed`,
                'FileDownloader'
            );
            return null;
        }
    }
}

/**
 * Creates a FileDownloader instance.
 * 
 * @param options - Configuration options
 * @returns A new FileDownloader instance
 * 
 * @example
 * ```typescript
 * const downloader = createFileDownloader();
 * 
 * const response = await downloader.downloadFile(
 *   'https://example.com/image.png',
 *   'my-image.png'
 * );
 * 
 * if (response) {
 *   console.log('File downloaded successfully');
 * }
 * ```
 */
export function createFileDownloader(options?: {
    fileOps?: FileOperations;
    client?: AxiosInstance;
}): FileDownloader {
    return new FileDownloaderImpl(options);
}
