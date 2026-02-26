import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          name: "gh-stats",
          description: "GitHub stats as styled images for your profile",
          endpoints: {
            langs: "/langs/:username",
            rank: "/rank/:username",
          },
          example: {
            langs: "/langs/torvalds",
            rank: "/rank/torvalds",
          },
        }),
    },
  },
});
