/**
 * Response structure for account details endpoint
 */
export interface AccountDetails {
  /** Indicates if the request was successful */
  success: boolean;
  /** Account data object */
  data: {
    /** Unique user identifier */
    id: string;
    /** Username of the account */
    username: string;
    /** Whether multi-factor authentication is enabled */
    mfa_enabled: boolean;
    /** Whether the user has a pro subscription */
    pro: boolean;
    /** Whether the user has beta access */
    beta: boolean;
    /** Whether the user is an administrator */
    admin: boolean;
    /** Whether the user is a staff member */
    staff: boolean;
    /** User's email address */
    email: string;
    /** Whether the email has been verified */
    email_verified: boolean;
    /** User's phone number (optional) */
    phone?: string;
    /** URL to user's avatar image (optional) */
    avatar?: string;
    /** Default region for uploads */
    upload_region: string;
    /** Timestamp of last login */
    last_login: string;
  };
}

/**
 * Response structure for domains endpoint
 */
export interface DomainResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Domains data object */
  data: {
    /** List of domains registered by the user */
    domains: [
      {
        /** Domain name */
        name: string;
        /** User ID of the domain owner */
        owner: string;
        /** Number of uploads associated with this domain */
        uploads: number;
      },
    ];
  };
}

/**
 * Response structure for size endpoint
 */
export interface SizeResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Size data object */
  data: {
    /** Current total size of user's uploads in bytes */
    user: number;
    /** Maximum upload size limit in bytes */
    limit: number;
    /** User's premium tier level */
    premium_tier: number;
  };
}

/**
 * Options for uploading a file
 */
export interface UploadOptions {
  /** File extension (e.g., 'png', 'jpg'). Defaults to 'png' */
  extension?: string;
  /** Custom filename. If not provided, a random name will be generated */
  filename?: string;
  /** Domain to upload to. Uses defaultURL from client config if not provided */
  domain?: string;
}

/**
 * Information for updating a file
 */
export interface UpdateFileInfo {
  /** New name for the file */
  name?: string;
  /** New extension for the file */
  extension?: string;
}

/**
 * Response structure for file upload endpoint
 */
export interface UploadFileResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Size of the uploaded file in bytes */
  size: number;
  /** Upload data object */
  data: {
    /** Unique identifier for the uploaded file */
    id: string;
    /** Name of the uploaded file */
    name: string;
    /** Region where the file was uploaded */
    region: string;
    /** Full filename including extension */
    filename: string;
    /** File extension */
    extension: string;
    /** Domain where the file is hosted */
    domain: string;
    /** File type identifier */
    type: number;
    /** List of user permissions for this file */
    permissions: [
      {
        /** User with access to the file */
        user: TixteUser;
        /** Access level granted to the user */
        access_level: number;
      },
    ];
    /** Full URL to the file page */
    url: string;
    /** Direct URL to the file resource */
    direct_url: string;
    /** URL to delete the file */
    deletion_url: string;
    /** Response message */
    message: string;
  };
}

/**
 * Response structure for file update endpoint
 */
export interface UpdateFileResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Updated file data object */
  data: {
    /** Unique asset identifier */
    asset_id: string;
    /** Domain where the file is hosted */
    domain: string;
    /** File extension */
    extension: string;
    /** MIME type of the file */
    mimetype: string;
    /** Name of the file */
    name: string;
    /** Size of the file in bytes */
    size: number;
    /** Timestamp when the file was uploaded */
    uploaded_at: string;
  };
}

/**
 * Response structure for file deletion endpoint
 */
export interface DeleteFileResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Deletion data object */
  data: {
    /** Confirmation message */
    message: string;
  };
}

/**
 * Tixte user information
 */
export interface TixteUser {
  /** Unique user identifier */
  id: string;
  /** Username */
  username: string;
  /** URL to user's avatar image */
  avatar: string;
}

export interface TixteUpload {
  /** Unique asset identifier */
  asset_id: string;
  /** File name */
  name: string;
  /** File extension */
  extension: string;
  /** MIME type of the file */
  mimetype: string;
  /** Domain where the file is hosted */
  domain: string;
  /** Size of the file in bytes */
  size: number;
  /** Timestamp when the file was uploaded */
  uploaded_at: string;
}

/**
 * Response structure for listing uploads endpoint
 */
export interface UploadsResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** Uploads data object */
  data: {
    /** Array of uploaded files */
    uploads: TixteUpload[];
    /** Current page number */
    page: number;
    /** Total number of pages */
    total_pages: number;
    /** Total number of uploads */
    total: number;
  };
}

/**
 * Error response structure from Tixte API
 */
export interface TixteError {
  /** Indicates if the request was successful (always false for errors) */
  success: boolean;
  /** Error details object */
  error: {
    /** Error code */
    code: string;
    /** Human-readable error message */
    message: string;
  };
}
