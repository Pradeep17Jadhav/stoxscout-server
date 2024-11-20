/* eslint-disable no-unused-vars */
enum ErrorCodes {
    // General application errors
    INTERNAL_SERVER_ERROR = 1000, // Internal server error (generic)

    // Authentication & Authorization errors
    TOKEN_NOT_DEFINED = 1100, // Token is missing or undefined
    TOKEN_EXPIRED = 1101, // Token has expired
    INVALID_TOKEN = 1102, // Invalid token
    UNAUTHORIZED = 1103, // User is unauthorized
    NO_PERMISSION = 1104, // User doesn't have the required permissions
    INVALID_PASSWORD = 1105, // Incorrect password provided
    INVALID_CREDENTIALS = 1106, // Invalid username/password combination
    SESSION_EXPIRED = 1107, // Session has expired
    SESSION_UNAVAILABLE = 1108, // Session not available

    // Validation errors
    FIELD_REQUIRED = 1200, // Required field is missing
    INVALID_FIELD_FORMAT = 1201, // Field format is invalid (e.g., invalid email)
    MISSING_PARAMETER = 1202, // Missing a parameter in the request
    INVALID_INPUT = 1203, // Invalid input data
    TOO_MANY_REQUESTS = 1204, // Rate-limiting error (too many requests)

    // Resource errors
    RESOURCE_NOT_FOUND = 1300, // Resource not found
    RESOURCE_ALREADY_EXISTS = 1301, // Resource already exists (conflict)

    // Environment variable errors
    ENV_VARIABLE_NOT_DEFINED = 1400, // Environment variable is missing
    MISSING_DATABASE_URL = 1401, // Database URL is not defined in env variables
    MISSING_JWT_SECRET = 1402, // JWT_SECRET is not defined in env variables

    // External API errors
    EXTERNAL_API_ERROR = 1500, // External API call failed
    EXTERNAL_API_UNAUTHORIZED = 1501, // Unauthorized access to external API

    MONGO_ERROR = 1600
}

export default ErrorCodes;
