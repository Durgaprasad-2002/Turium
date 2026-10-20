type LogValue = string | number | boolean | null | undefined;
type LogContext = Record<string, LogValue>;
type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, event: string, context: LogContext = {}) {
  const record = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: "knowledge-inbox-api",
    event,
    ...context,
  });
  if (level === "error") console.error(record);
  else if (level === "warn") console.warn(record);
  else console.info(record);
}

export const logger = {
  info: (event: string, context?: LogContext) => write("info", event, context),
  warn: (event: string, context?: LogContext) => write("warn", event, context),
  error: (event: string, context?: LogContext) =>
    write("error", event, context),
};

export function errorContext(error: unknown): LogContext {
  if (error instanceof Error)
    return { errorName: error.name, errorMessage: error.message };
  return { errorName: "UnknownError" };
}
