import { createFileRoute } from "@tanstack/react-router";
import { usernameParam } from "@/shared/schemas";
import { langsController } from "@/features/langs/controller";
import { checkAllowlist } from "@/middleware/allowlist";

export const Route = createFileRoute("/langs/$username")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const parsed = usernameParam.safeParse(params);
        if (!parsed.success)
          return Response.json(
            { error: { code: "INVALID_USERNAME", message: "Invalid GitHub username" } },
            { status: 400 }
          );

        const deny = checkAllowlist(parsed.data.username);
        if (deny) return deny;

        return langsController(parsed.data.username);
      },
    },
  },
});
