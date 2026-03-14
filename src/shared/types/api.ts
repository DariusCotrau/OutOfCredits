import type { Timestamp, LoadingState, AppError } from './common';
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  fieldErrors?: FieldError[];
  statusCode?: number;
  timestamp: Timestamp;
  requestId?: string;
}
export interface FieldError {
  field: string;
  message: string;
  rule?: string;
  expected?: string;
  received?: string;
}
export interface ResponseMeta {
  requestId: string;
  timestamp: Timestamp;
  processingTime: number;
  apiVersion: string;
  pagination?: PaginationInfo;
  cache?: CacheInfo;
}
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: string;
  previousCursor?: string;
}
export interface CacheInfo {
  fromCache: boolean;
  expiresAt?: Timestamp;
  cacheKey?: string;
}
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  useCache?: boolean;
  cacheTTL?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}
export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}
export interface SearchRequest extends PaginatedRequest {
  query: string;
  searchFields?: string[];
  filters?: Record<string, unknown>;
}
export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: AppError | null;
  lastFetched: Timestamp | null;
  isStale: boolean;
}
export interface MutationState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: AppError | null;
}
export interface BatchResult<T> {
  successCount: number;
  failedCount: number;
  successful: T[];
  failed: Array<{ item: T; error: ApiError }>;
}
export interface Service<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  get(id: string): Promise<ApiResponse<T>>;
  getAll(params?: PaginatedRequest): Promise<ApiResponse<T[]>>;
  create(data: CreateDTO): Promise<ApiResponse<T>>;
  update(id: string, data: UpdateDTO): Promise<ApiResponse<T>>;
  delete(id: string): Promise<ApiResponse<void>>;
}
export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(criteria?: Partial<T>): Promise<T[]>;
  save(entity: T): Promise<T>;
  deleteById(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
export interface SyncResult {
  success: boolean;
  syncedCount: number;
  conflictCount: number;
  conflicts: SyncConflict[];
  timestamp: Timestamp;
  nextSyncToken?: string;
}
export interface SyncConflict {
  entityType: string;
  entityId: string;
  localVersion: unknown;
  remoteVersion: unknown;
  conflictType: ConflictType;
  suggestedResolution: ConflictResolution;
}
export type ConflictType =
  | 'update_update'
  | 'update_delete'
  | 'delete_update'
  | 'create_create';
export type ConflictResolution =
  | 'use_local'
  | 'use_remote'
  | 'merge'
  | 'manual';
export interface WebhookEvent<T = unknown> {
  id: string;
  type: string;
  timestamp: Timestamp;
  data: T;
  source: string;
  version: string;
}
export interface Subscription {
  id: string;
  topic: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  unsubscribe: () => void;
}
export interface RealtimeMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: Timestamp;
  senderId?: string;
}
export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  PREMIUM_REQUIRED = 'PREMIUM_REQUIRED',
}
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNKNOWN]: 'An unexpected error occurred.',
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCode.CANCELLED]: 'Request was cancelled.',
  [ErrorCode.UNAUTHORIZED]: 'Please sign in to continue.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.ALREADY_EXISTS]: 'This resource already exists.',
  [ErrorCode.CONFLICT]: 'A conflict occurred. Please refresh and try again.',
  [ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
  [ErrorCode.QUOTA_EXCEEDED]: 'You have exceeded your quota.',
  [ErrorCode.INTERNAL_ERROR]: 'An internal error occurred. Please try again.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable.',
  [ErrorCode.MAINTENANCE]: 'The service is under maintenance.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions.',
  [ErrorCode.FEATURE_DISABLED]: 'This feature is currently disabled.',
  [ErrorCode.PREMIUM_REQUIRED]: 'This feature requires a premium subscription.',
};
