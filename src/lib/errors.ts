/** Typed errors so route handlers can map failures to the right HTTP status. */

export type ErrorCode =
  | "validation_error"
  | "fetch_error"
  | "analysis_error"
  | "generation_error"
  | "not_found"
  | "internal_error";

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  fields: Record<string, string>;
  constructor(fields: Record<string, string>, message = "Please check the form.") {
    super("validation_error", message, 400, fields);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

/** Website could not be fetched/parsed. Recoverable — we degrade gracefully. */
export class FetchError extends AppError {
  constructor(message: string, details?: unknown) {
    super("fetch_error", message, 422, details);
    this.name = "FetchError";
  }
}
