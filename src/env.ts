import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    GITHUB_TOKEN: z.string().min(1).optional(),
    ALLOWED_USERNAMES: z
      .string()
      .transform((s) =>
        s
          .split(",")
          .map((u) => u.trim().toLowerCase())
          .filter(Boolean)
      )
      .pipe(z.array(z.string()).min(1))
      .optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
