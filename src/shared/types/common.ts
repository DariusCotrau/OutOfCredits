export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>;
export type StringLiteral<T> = T extends string
  ? string extends T
    ? never
    : T
  : never;
export type Timestamp = number;
export type DateString = `${number}-${number}-${number}`;
export type DateTimeString = string;
export type TimeString = `${number}:${number}`;
export type DurationMinutes = number;
export type DurationMs = number;
export type UserId = string;
export type DocumentId = string;
export type PackageName = string;
export type BadgeId = string;
export type ActivityId = string;
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type SyncStatus = 'synced' | 'pending' | 'error' | 'conflict';
export type FeatureStatus = 'enabled' | 'disabled' | 'beta' | 'deprecated';
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type HexColor = `#${string}`;
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}
export interface RGBAColor extends RGBColor {
  a: number;
}
export type SemanticColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'background'
  | 'surface'
  | 'text'
  | 'textSecondary'
  | 'border';
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';
export type DayOfWeekNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';
export type WeekNumber = number;
export type Email = string & { readonly __brand: 'Email' };
export type URLString = string & { readonly __brand: 'URL' };
export type NonEmptyString = string & { readonly __brand: 'NonEmptyString' };
export type PositiveNumber = number & { readonly __brand: 'PositiveNumber' };
export type Percentage = number & { readonly __brand: 'Percentage' };
export interface KeyValue<K = string, V = unknown> {
  key: K;
  value: V;
}
export interface Range<T = number> {
  min: T;
  max: T;
}
export interface Point {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}
export interface Rect extends Point, Size {}
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Timestamp;
  stack?: string;
}
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };
export type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;
export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;
export type Unsubscribe = () => void;
export interface ListenerRegistration {
  unsubscribe: Unsubscribe;
  id: string;
}
