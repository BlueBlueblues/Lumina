import "dotenv/config";
import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false", "1", "0"])
  .default("false")
  .transform((value) => value === "true" || value === "1");

const optionalString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  TRUST_PROXY: booleanFromString,
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://127.0.0.1:5173"),

  DATABASE_URL: optionalString,
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),

  DEEPSEEK_API_KEY: optionalString,
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  DEEPSEEK_CHAT_MODEL: z.string().min(1).default("deepseek-chat"),
  DEEPSEEK_VISION_MODEL: z.string().min(1).default("deepseek-chat"),
  AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.4),
  AI_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(0).default(30),

  TOKEN_PEPPER: z.string().default(""),
  PAIRING_CODE_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(600),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export const isProduction = config.NODE_ENV === "production";

if (isProduction && config.TOKEN_PEPPER.length < 16) {
  console.error("TOKEN_PEPPER must be at least 16 characters in production.");
  process.exit(1);
}

export const corsOrigins = config.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
