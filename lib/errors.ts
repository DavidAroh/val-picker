// Error codes and messages for the Valentine Exchange system
export const ERRORS = {
    // Authentication errors
    EMAIL_ALREADY_EXISTS: {
        code: 'AUTH001',
        message: 'This email is already registered',
        action: 'Try logging in instead',
    },
    INVALID_CREDENTIALS: {
        code: 'AUTH002',
        message: 'Invalid email or password',
        action: 'Please check your credentials',
    },
    INVALID_INVITE_CODE: {
        code: 'AUTH003',
        message: 'Invalid or expired invite code',
        action: 'Request a new invitation',
    },
    REGISTRATION_CLOSED: {
        code: 'EVENT001',
        message: 'Registration has closed for this event',
        action: 'Join us next year!',
    },

    // Profile errors
    PROFILE_INCOMPLETE: {
        code: 'PROFILE001',
        message: 'Please complete all required fields',
        action: 'Fill in missing information',
    },
    WISHLIST_ITEM_LIMIT: {
        code: 'PROFILE002',
        message: 'Maximum 10 wishlist items allowed',
        action: 'Remove some items to add more',
    },

    // Match errors
    ALREADY_REVEALED: {
        code: 'MATCH001',
        message: 'You already drew your Valentine',
        action: 'View your match',
    },
    DRAW_NOT_READY: {
        code: 'MATCH002',
        message: "The draw hasn't started yet",
        action: "Check back on Valentine's Day",
    },
    NO_MATCH_ASSIGNED: {
        code: 'MATCH003',
        message: 'No match found for your account',
        action: 'Contact support',
    },

    // Chat errors
    THREAD_NOT_FOUND: {
        code: 'CHAT004',
        message: 'Chat thread not found',
        action: 'Return to home',
    },
    UNAUTHORIZED_THREAD: {
        code: 'CHAT001',
        message: "You don't have access to this chat",
        action: 'Return to your match',
    },
    MESSAGE_TOO_LONG: {
        code: 'CHAT002',
        message: 'Message exceeds 1000 characters',
        action: 'Shorten your message',
    },
    IMAGE_TOO_LARGE: {
        code: 'CHAT003',
        message: 'Image must be under 5MB',
        action: 'Compress or choose smaller image',
    },

    // System errors
    SERVER_ERROR: {
        code: 'SYS001',
        message: 'Something went wrong on our end',
        action: 'Please try again in a moment',
    },
    NETWORK_ERROR: {
        code: 'SYS002',
        message: 'Connection lost',
        action: 'Check your internet connection',
    },
    UNAUTHORIZED: {
        code: 'AUTH004',
        message: 'You must be logged in to access this',
        action: 'Please log in',
    },
} as const;

export type ErrorCode = keyof typeof ERRORS;

// API Error response format
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        action: string;
        details?: unknown;
    };
}

// API Success response format
export interface ApiSuccess<T = unknown> {
    success: true;
    data: T;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// Helper to create error response
export function createErrorResponse(
    errorCode: ErrorCode,
    details?: unknown
): ApiError {
    const error = ERRORS[errorCode];
    return {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            action: error.action,
            details,
        },
    };
}

// Helper to create success response
export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
    return {
        success: true,
        data,
    };
}
