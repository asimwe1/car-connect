/**
 * Error message utility for production-ready error handling
 * Converts technical errors into user-friendly messages
 */

const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Common user-friendly error messages
 */
export const ErrorMessages = {
    // Network & Connection
    NETWORK_ERROR: "We're having trouble connecting. Please check your internet connection and try again.",
    TIMEOUT_ERROR: "The request is taking longer than expected. Please try again.",
    SERVER_ERROR: "Something went wrong on our end. Please try again in a moment.",

    // Authentication
    INVALID_CREDENTIALS: "Invalid email/phone or password. Please check your credentials and try again.",
    SESSION_EXPIRED: "Your session has expired. Please sign in again.",
    UNAUTHORIZED: "You don't have permission to perform this action.",

    // Validation
    VALIDATION_ERROR: "Please check your information and try again.",
    MISSING_FIELDS: "Please fill in all required fields.",

    // Generic
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
    TRY_AGAIN: "Something went wrong. Please try again.",
} as const;

/**
 * Maps technical error patterns to user-friendly messages
 */
const errorPatterns: Array<{ pattern: RegExp | string; message: string }> = [
    // Network errors
    { pattern: /failed to fetch/i, message: ErrorMessages.NETWORK_ERROR },
    { pattern: /network error/i, message: ErrorMessages.NETWORK_ERROR },
    { pattern: /networkerror/i, message: ErrorMessages.NETWORK_ERROR },
    { pattern: /ERR_INTERNET_DISCONNECTED/i, message: ErrorMessages.NETWORK_ERROR },
    { pattern: /ERR_NETWORK_CHANGED/i, message: ErrorMessages.NETWORK_ERROR },
    { pattern: /offline/i, message: ErrorMessages.NETWORK_ERROR },

    // Timeout errors
    { pattern: /timeout/i, message: ErrorMessages.TIMEOUT_ERROR },
    { pattern: /timed out/i, message: ErrorMessages.TIMEOUT_ERROR },
    { pattern: /request.*abort/i, message: ErrorMessages.TIMEOUT_ERROR },

    // Server errors
    { pattern: /500/i, message: ErrorMessages.SERVER_ERROR },
    { pattern: /502/i, message: ErrorMessages.SERVER_ERROR },
    { pattern: /503/i, message: ErrorMessages.SERVER_ERROR },
    { pattern: /504/i, message: ErrorMessages.SERVER_ERROR },
    { pattern: /internal server error/i, message: ErrorMessages.SERVER_ERROR },
    { pattern: /bad gateway/i, message: ErrorMessages.SERVER_ERROR },
    { pattern: /service unavailable/i, message: ErrorMessages.SERVER_ERROR },

    // Authentication errors
    { pattern: /invalid.*credentials/i, message: ErrorMessages.INVALID_CREDENTIALS },
    { pattern: /invalid.*password/i, message: ErrorMessages.INVALID_CREDENTIALS },
    { pattern: /invalid.*email/i, message: ErrorMessages.INVALID_CREDENTIALS },
    { pattern: /invalid.*phone/i, message: ErrorMessages.INVALID_CREDENTIALS },
    { pattern: /authentication.*failed/i, message: ErrorMessages.INVALID_CREDENTIALS },
    { pattern: /unauthorized/i, message: ErrorMessages.SESSION_EXPIRED },
    { pattern: /401/i, message: ErrorMessages.SESSION_EXPIRED },
    { pattern: /403/i, message: ErrorMessages.UNAUTHORIZED },
    { pattern: /token.*expired/i, message: ErrorMessages.SESSION_EXPIRED },
    { pattern: /session.*expired/i, message: ErrorMessages.SESSION_EXPIRED },

    // Validation errors
    { pattern: /validation.*failed/i, message: ErrorMessages.VALIDATION_ERROR },
    { pattern: /invalid.*format/i, message: ErrorMessages.VALIDATION_ERROR },
    { pattern: /required.*field/i, message: ErrorMessages.MISSING_FIELDS },
    { pattern: /missing.*field/i, message: ErrorMessages.MISSING_FIELDS },
];

/**
 * Converts any error to a user-friendly message
 * @param error - The error object or message
 * @param fallbackMessage - Optional custom fallback message
 * @returns User-friendly error message
 */
export function getUserFriendlyError(
    error: unknown,
    fallbackMessage: string = ErrorMessages.UNKNOWN_ERROR
): string {
    // Handle null/undefined
    if (!error) {
        return fallbackMessage;
    }

    // Extract error message
    let errorMessage = '';

    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
        // Try to extract message from object
        const errorObj = error as any;
        errorMessage = errorObj.message || errorObj.error || errorObj.msg || '';
    }

    // If no message extracted, return fallback
    if (!errorMessage) {
        return fallbackMessage;
    }

    // Check if the error message is already user-friendly
    // (contains known friendly patterns)
    const isAlreadyFriendly =
        errorMessage.includes("Please") ||
        errorMessage.includes("try again") ||
        errorMessage.includes("check your") ||
        !errorMessage.includes("Error:") &&
        !errorMessage.includes("fetch") &&
        !errorMessage.match(/\d{3}/); // HTTP status codes

    if (isAlreadyFriendly) {
        return errorMessage;
    }

    // Match against known patterns
    for (const { pattern, message } of errorPatterns) {
        if (typeof pattern === 'string') {
            if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
                return message;
            }
        } else {
            if (pattern.test(errorMessage)) {
                return message;
            }
        }
    }

    // If in development, we might want to show the actual error
    // In production, always show user-friendly message
    if (!IS_PRODUCTION && errorMessage.length < 100) {
        return errorMessage;
    }

    return fallbackMessage;
}

/**
 * Logs error details (only in development)
 * @param context - Context where error occurred
 * @param error - The error object
 */
export function logError(context: string, error: unknown): void {
    if (!IS_PRODUCTION) {
        console.error(`[${context}]`, error);
    }
}

/**
 * Combines error logging and message extraction
 * @param context - Context where error occurred
 * @param error - The error object
 * @param fallbackMessage - Optional custom fallback message
 * @returns User-friendly error message
 */
export function handleError(
    context: string,
    error: unknown,
    fallbackMessage?: string
): string {
    logError(context, error);
    return getUserFriendlyError(error, fallbackMessage);
}
