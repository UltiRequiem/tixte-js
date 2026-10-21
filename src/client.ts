import type {
  AccountDetails,
  DeleteFileResponse,
  DomainResponse,
  SizeResponse,
  TixteError,
  UploadFileResponse,
  UploadOptions,
  UpdateFileInfo,
  UpdateFileResponse,
  UploadsResponse,
} from "./types.js";

/**
 * API endpoints for Tixte service
 */
export const ENDPOINTS = {
  /** Base URL for Tixte API v1 */
  BASE_URL: "https://api.tixte.com/v1",
  /** Endpoint for account information */
  ACCOUNT_ENDPOINT: "/users/@me",
  /** Endpoint for file uploads */
  UPLOAD_ENDPOINT: "/upload",
  /** Endpoint for managing user's uploaded files */
  FILE_ENDPOINT: "/users/@me/uploads",
  /** Endpoint for managing domains */
  DOMAINS_ENDPOINT: "/users/@me/domains",
  /** Endpoint for getting upload size information */
  SIZE_ENDPOINT: "/users/@me/uploads/size",
} as const;

/**
 * Error thrown when the Tixte API responds with a non-2xx status
 */
export class TixteApiError extends Error {
  /**
   * @param status - HTTP status code of the response
   * @param statusText - HTTP status text of the response
   * @param body - Parsed error body, if the API returned one
   */
  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly body?: TixteError,
  ) {
    super(`HTTP ${status}: ${body?.error?.message ?? statusText}`.trim());
    this.name = "TixteApiError";
  }
}

/**
 * Client for interacting with the Tixte API
 */
export class TixteClient {
  /**
   * Creates a new TixteClient instance
   * @param apiKey - Your Tixte API key for authentication
   * @param options - Optional configuration options
   */
  constructor(
    private readonly apiKey: string,
    private readonly options?: { defaultURL?: string },
  ) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${ENDPOINTS.BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: this.apiKey,
        ...(init.headers as Record<string, string>),
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => undefined);
      throw new TixteApiError(response.status, response.statusText, body);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Gets account details of user
   * @returns Promise resolving to account details
   */
  async accountInfo(): Promise<AccountDetails> {
    return this.request<AccountDetails>(ENDPOINTS.ACCOUNT_ENDPOINT);
  }

  /**
   * Gets all domains registered by user
   * @returns Promise resolving to domains information
   */
  async domains(): Promise<DomainResponse> {
    return this.request<DomainResponse>(ENDPOINTS.DOMAINS_ENDPOINT);
  }

  /**
   * Gets total uploaded file size of user
   * @returns Promise resolving to size information
   */
  async size(): Promise<SizeResponse> {
    return this.request<SizeResponse>(ENDPOINTS.SIZE_ENDPOINT);
  }

  /**
   * Uploads a file to Tixte
   * @param buffer - The file data as a Uint8Array, ArrayBuffer or Blob
   * @param options - Upload options including extension, filename, and domain
   * @returns Promise resolving to upload response with file details
   * @throws Error if no domain is provided and no default URL is set
   */
  async uploadFile(
    buffer: Uint8Array | ArrayBuffer | Blob,
    options: UploadOptions = {},
  ): Promise<UploadFileResponse> {
    const domain = options.domain ?? this.options?.defaultURL;
    if (!domain) {
      throw new Error("No domain provided and no default URL set");
    }

    const filename = `${options.filename ?? crypto.randomUUID()}.${options.extension ?? "png"}`;
    const formData = new FormData();
    const blob =
      buffer instanceof Blob
        ? buffer
        : new Blob([buffer as Uint8Array<ArrayBuffer> | ArrayBuffer]);
    formData.append("file", blob, filename);

    return this.request<UploadFileResponse>(
      `${ENDPOINTS.UPLOAD_ENDPOINT}?random_name=${!options.filename}`,
      {
        method: "POST",
        headers: { domain },
        body: formData,
      },
    );
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
    return this.request<UpdateFileResponse>(
      `${ENDPOINTS.FILE_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileInfo),
      },
    );
  }

  /**
   * Lists uploaded files with pagination
   * @param page - Page number to retrieve (default: 1)
   * @param amount - Number of uploads per page (default: 3)
   * @returns Promise resolving to uploads list with pagination info
   */
  async uploads(page = 1, amount = 3): Promise<UploadsResponse> {
    const query = new URLSearchParams({
      page: String(page),
      amount: String(amount),
    });
    return this.request<UploadsResponse>(`${ENDPOINTS.FILE_ENDPOINT}?${query}`);
  }

  /**
   * Deletes a file by its ID
   * @param id - The file ID or asset ID to delete
   * @returns Promise resolving to deletion confirmation
   */
  async deleteFile(id: string | number): Promise<DeleteFileResponse> {
    return this.request<DeleteFileResponse>(
      `${ENDPOINTS.FILE_ENDPOINT}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  }
}
