import Axios, { AxiosInstance } from "axios";
import FormData from "form-data";

import { nanoid } from "nanoid";

import type {
	AccountDetails,
	DeleteFileResponse,
	DomainResponse,
	SizeResponse,
	UploadFileResponse,
	UploadOptions,
	UpdateFileInfo,
	UpdateFileResponse,
	UploadsResponse,
} from "./types";

/**
 * API endpoints for Tixte service
 */
export enum ENDPOINTS {
	/** Base URL for Tixte API v1 */
	BASE_URL = "https://api.tixte.com/v1",
	/** Endpoint for account information */
	ACCOUNT_ENDPOINT = "/users/@me",
	/** Endpoint for file uploads */
	UPLOAD_ENDPOINT = "/upload",
	/** Endpoint for managing user's uploaded files */
	FILE_ENDPOINT = "/users/@me/uploads",
	/** Endpoint for managing domains */
	DOMAINS_ENDPOINT = "/users/@me/domains",
	/** Endpoint for getting upload size information */
	SIZE_ENDPOINT = "/users/@me/uploads/size",
}

/**
 * Client for interacting with the Tixte API
 */
export class TixteClient {
	private fetcher: AxiosInstance;

	/**
	 * Creates a new TixteClient instance
	 * @param apiKey - Your Tixte API key for authentication
	 * @param options - Optional configuration options
	 */
	constructor(
		private apiKey: string,
		private options?: { defaultURL?: string },
	) {
		this.fetcher = Axios.create({ baseURL: ENDPOINTS.BASE_URL });
		this.fetcher.defaults.headers.common.Authorization = this.apiKey;
	}

	/**
	 * Gets account details of user
	 * @returns Promise resolving to account details
	 */
	async accountInfo(): Promise<AccountDetails> {
		const result = await this.fetcher.get<AccountDetails>(
			ENDPOINTS.ACCOUNT_ENDPOINT,
		);

		return result.data;
	}

	/**
	 * Gets all domains registered by user
	 * @returns Promise resolving to domains information
	 */
	async domains(): Promise<DomainResponse> {
		const result = await this.fetcher.get<DomainResponse>(
			ENDPOINTS.DOMAINS_ENDPOINT,
		);

		return result.data;
	}

	/**
	 * Gets total uploaded file size of user
	 * @returns Promise resolving to size information
	 */
	async size(): Promise<SizeResponse> {
		const result = await this.fetcher.get<SizeResponse>(
			ENDPOINTS.SIZE_ENDPOINT,
		);
		return result.data;
	}

	/**
	 * Uploads a file to Tixte
	 * @param buffer - The file data as a Uint8Array
	 * @param options - Upload options including extension, filename, and domain
	 * @returns Promise resolving to upload response with file details
	 * @throws Error if no domain is provided and no default URL is set
	 */
	async uploadFile(
		buffer: Uint8Array,
		options: UploadOptions = {},
	): Promise<UploadFileResponse> {
		if (!options.domain) {
			if (!this.options?.defaultURL) {
				throw new Error("No domain provided and no default URL set");
			}

			options.domain = this.options.defaultURL;
		}

		const formData = new FormData();

		formData.append(
			"file",
			buffer,
			`${options.filename ?? nanoid()}.${options.extension ?? "png"}`,
		);

		const uploadResponse = await this.fetcher.post<UploadFileResponse>(
			ENDPOINTS.UPLOAD_ENDPOINT,
			formData,
			{
				params: { random_name: !options.filename },
				headers: { ...formData.getHeaders(), domain: options.domain },
			},
		);

		return uploadResponse.data;
	}

	/**
	 * Updates information for an existing file
	 * @param id - The file ID or asset ID to update
	 * @param fileInfo - Object containing the fields to update (name, extension)
	 * @returns Promise resolving to update response with updated file details
	 */
	async updateFile(
		id: string | number,
		fileInfo: UpdateFileInfo,
	): Promise<UpdateFileResponse> {
		const uploadResponse = await this.fetcher.patch<UpdateFileResponse>(
			`${ENDPOINTS.FILE_ENDPOINT}/${id}`,
			fileInfo,
		);

		return uploadResponse.data;
	}

	/**
	 * Lists uploaded files with pagination
	 * @param page - Page number to retrieve (default: 1)
	 * @param amount - Number of uploads per page (default: 3)
	 * @returns Promise resolving to uploads list with pagination info
	 */
	async uploads(page = 1, amount = 3): Promise<UploadsResponse> {
		const response = await this.fetcher.get<UploadsResponse>(
			`${ENDPOINTS.FILE_ENDPOINT}?page=${page}&amount=${amount}`,
		);

		return response.data;
	}

	/**
	 * Deletes a file by its ID
	 * @param id - The file ID or asset ID to delete
	 * @returns Promise resolving to deletion confirmation
	 */
	async deleteFile(id: string | number): Promise<DeleteFileResponse> {
		const uploadResponse = await this.fetcher.delete<DeleteFileResponse>(
			`${ENDPOINTS.FILE_ENDPOINT}/${id}`,
		);

		return uploadResponse.data;
	}
}
