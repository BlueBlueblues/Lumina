import { z, type ZodTypeAny } from "zod";
import { AppError } from "./errors.js";

export function parseWith<S extends ZodTypeAny>(
  schema: S,
  value: unknown,
  label: string,
): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(400, "validation_error", `Invalid ${label}.`, result.error.issues);
  }
  return result.data;
}
