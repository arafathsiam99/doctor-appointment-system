// Utility Types

// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Extract specific properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Exclude specific properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Create a type with all properties as strings (useful for form data)
export type StringifyValues<T> = {
  [K in keyof T]: string;
};

// Create a nullable version of a type
export type Nullable<T> = T | null;

// Create an optional version of a type
export type Optional<T> = T | undefined;

// Create a type that can be either the type or a promise of the type
export type MaybePromise<T> = T | Promise<T>;

// Extract the return type of a function
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

// Extract the parameters of a function
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// Create a deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Create a type for form field states
export type FieldState<T> = {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
};

// Create a type for async states
export type AsyncState<T, E = Error> = {
  data?: T;
  loading: boolean;
  error?: E;
};

// Create a type for pagination metadata
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Create a type for sort options
export type SortOrder = 'asc' | 'desc';

export type SortOption<T> = {
  field: keyof T;
  order: SortOrder;
};