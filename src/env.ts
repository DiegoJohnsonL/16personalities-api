import chalk from "chalk"
import { z } from "zod"

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "staging", "test"])
      .default("development"),

    PORT: z.coerce
      .number()
      .default(5000)
      .describe("Port number for the server"),

    // Proxy configuration with defaults
    USE_PROXY: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
      
    PROXY_HOST: z
      .string()
      .default("")
      .transform((v) => v || undefined),
      
    PROXY_PORT: z.coerce
      .number()
      .default(0)
      .transform((v) => v || undefined),
      
    PROXY_USERNAME: z
      .string()
      .default("")
      .transform((v) => v || undefined),
      
    PROXY_PASSWORD: z
      .string()
      .default("")
      .transform((v) => v || undefined),
  })
  .superRefine((data, ctx) => {
    if (data.USE_PROXY) {
      if (!data.PROXY_HOST) {
        return ctx.addIssue({
          code: "custom",
          path: ["PROXY_HOST"],
          message: "PROXY_HOST is required when USE_PROXY is true",
        })
      }
      if (!data.PROXY_PORT) {
        return ctx.addIssue({
          code: "custom",
          path: ["PROXY_PORT"],
          message: "PROXY_PORT is required when USE_PROXY is true",
        })
      }
    }
    return true
  })

export type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)
if (!result.success) {
  console.error(
    chalk.red("Invalid environment variables Please check your .env file:")
  )
  console.error(
    chalk.red(
      result.error.errors
        .flatMap(
          (e) => `${chalk.redBright(`[${e.path?.join("][")}]`)}: ${e.message}`
        )
        .join("\n")
    )
  )

  process.exit(1)
}

export default result.data
