import { z } from "zod";

// GitHub username rules: 1-39 chars, alphanumeric or hyphens,
// cannot start or end with a hyphen.
export const usernameParam = z.object({
  username: z
    .string()
    .min(1)
    .max(39)
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "Invalid GitHub username"
    ),
});
