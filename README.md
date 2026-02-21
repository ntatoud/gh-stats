# gh-stats

GitHub statistics as styled images for your profile README.

Built with [Hono](https://hono.dev), [better-result](https://github.com/dmmulroy/better-result), and [Takumi](https://takumi.kane.tw).

## Endpoints

### Stats card

```
GET /stats/:username
```

Returns a 560×185 image with: stars, commits, PRs, issues, followers, and public repos.

### Top languages card

```
GET /langs/:username
```

Returns a dynamically sized image with the top 6 languages across the user's repos.

## Usage in a GitHub README

```markdown
![GitHub Stats](https://your-deployment/stats/yourusername)
![Top Languages](https://your-deployment/langs/yourusername)
```

## Running locally

```bash
cp .env.example .env
# Fill in GITHUB_TOKEN (optional but recommended to avoid rate limiting)

bun dev
```

The server starts on `http://localhost:3000`.

## Environment variables

| Variable       | Required | Description                                  |
|---------------|----------|----------------------------------------------|
| `GITHUB_TOKEN` | No       | GitHub PAT — raises rate limit from 60 to 5000 req/h |
| `PORT`         | No       | Server port (default: `3000`)                |

## Stack

- **[Hono](https://hono.dev)** — lightweight HTTP framework
- **[better-result](https://github.com/dmmulroy/better-result)** — Result type with generator-based composition for typed error handling
- **[Takumi](https://takumi.kane.tw)** — JSX → image (Rust-based, 2-10× faster than Satori)
- **[Bun](https://bun.sh)** — runtime & package manager
