/**
 * Result type utilities for consistent Ok/Err responses
 */

/**
 * Successful result
 */
export interface Ok<T> {
  ok: true
  data: T
}

/**
 * Error result
 */
export interface Err<E = ApiError> {
  ok: false
  error: E
}

/**
 * Result type - either Ok or Err
 */
export type Result<T, E = ApiError> = Ok<T> | Err<E>

/**
 * Standard API error shape
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Create a successful result
 */
export function Ok<T>(data: T): Ok<T> {
  return { ok: true, data }
}

/**
 * Create an error result
 */
export function Err<E = ApiError>(error: E): Err<E> {
  return { ok: false, error }
}

/**
 * Create an ApiError
 */
export function ApiError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return { code, message, details }
}

/**
 * Common error codes
 */
export const ErrorCode = {
  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

/**
 * Map error codes to HTTP status codes
 */
export const ErrorStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.NOT_IMPLEMENTED]: 501,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
}

/**
 * Get HTTP status code for an error
 */
export function getErrorStatus(error: ApiError): number {
  return ErrorStatusMap[error.code as ErrorCode] ?? 500
}

/**
 * Type guard to check if result is Ok
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true
}

/**
 * Type guard to check if result is Err
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false
}
