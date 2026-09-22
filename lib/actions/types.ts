/** Uniform result type for server actions consumed by client components. */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string };

export function actionError(message: string): ActionResult<never> {
  return { ok: false, error: message };
}

export function actionSuccess<T>(
  message?: string,
  data?: T
): ActionResult<T> {
  return { ok: true, message, ...(data !== undefined ? { data } : {}) };
}

/**
 * Maps unexpected database errors to a safe message. Never exposes internal
 * error details (constraint names, SQL, etc.) to the client.
 */
export function safeDbError(
  error: { code?: string; message?: string } | null,
  fallback = "Something went wrong. Please try again."
): string {
  if (error?.code === "42501") {
    return "You don't have permission to perform this action.";
  }
  return fallback;
}
