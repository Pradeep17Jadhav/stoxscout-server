/* eslint-disable no-unused-vars */
var ErrorCodes;
(function (ErrorCodes) {
    // General application errors
    ErrorCodes[ErrorCodes["INTERNAL_SERVER_ERROR"] = 1000] = "INTERNAL_SERVER_ERROR";
    // Authentication & Authorization errors
    ErrorCodes[ErrorCodes["TOKEN_NOT_DEFINED"] = 1100] = "TOKEN_NOT_DEFINED";
    ErrorCodes[ErrorCodes["TOKEN_EXPIRED"] = 1101] = "TOKEN_EXPIRED";
    ErrorCodes[ErrorCodes["INVALID_TOKEN"] = 1102] = "INVALID_TOKEN";
    ErrorCodes[ErrorCodes["UNAUTHORIZED"] = 1103] = "UNAUTHORIZED";
    ErrorCodes[ErrorCodes["NO_PERMISSION"] = 1104] = "NO_PERMISSION";
    ErrorCodes[ErrorCodes["INVALID_PASSWORD"] = 1105] = "INVALID_PASSWORD";
    ErrorCodes[ErrorCodes["INVALID_CREDENTIALS"] = 1106] = "INVALID_CREDENTIALS";
    ErrorCodes[ErrorCodes["SESSION_EXPIRED"] = 1107] = "SESSION_EXPIRED";
    ErrorCodes[ErrorCodes["SESSION_UNAVAILABLE"] = 1108] = "SESSION_UNAVAILABLE";
    // Validation errors
    ErrorCodes[ErrorCodes["FIELD_REQUIRED"] = 1200] = "FIELD_REQUIRED";
    ErrorCodes[ErrorCodes["INVALID_FIELD_FORMAT"] = 1201] = "INVALID_FIELD_FORMAT";
    ErrorCodes[ErrorCodes["MISSING_PARAMETER"] = 1202] = "MISSING_PARAMETER";
    ErrorCodes[ErrorCodes["INVALID_INPUT"] = 1203] = "INVALID_INPUT";
    ErrorCodes[ErrorCodes["TOO_MANY_REQUESTS"] = 1204] = "TOO_MANY_REQUESTS";
    // Resource errors
    ErrorCodes[ErrorCodes["RESOURCE_NOT_FOUND"] = 1300] = "RESOURCE_NOT_FOUND";
    ErrorCodes[ErrorCodes["RESOURCE_ALREADY_EXISTS"] = 1301] = "RESOURCE_ALREADY_EXISTS";
    // Environment variable errors
    ErrorCodes[ErrorCodes["ENV_VARIABLE_NOT_DEFINED"] = 1400] = "ENV_VARIABLE_NOT_DEFINED";
    ErrorCodes[ErrorCodes["MISSING_DATABASE_URL"] = 1401] = "MISSING_DATABASE_URL";
    ErrorCodes[ErrorCodes["MISSING_JWT_SECRET"] = 1402] = "MISSING_JWT_SECRET";
    // External API errors
    ErrorCodes[ErrorCodes["EXTERNAL_API_ERROR"] = 1500] = "EXTERNAL_API_ERROR";
    ErrorCodes[ErrorCodes["EXTERNAL_API_UNAUTHORIZED"] = 1501] = "EXTERNAL_API_UNAUTHORIZED";
    ErrorCodes[ErrorCodes["MONGO_ERROR"] = 1600] = "MONGO_ERROR";
})(ErrorCodes || (ErrorCodes = {}));
export default ErrorCodes;
