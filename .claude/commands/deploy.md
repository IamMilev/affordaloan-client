# Deploy

Run the full CI pipeline and push to remote on success.

**Allowed tools:** Bash, Read only. Do NOT edit any files — if a step fails, report the error and stop.

## Steps

1. Run `pnpm test` in the project root. If it fails, report the failing tests and stop.
2. Run `pnpm lint`. If it fails, report the lint errors and stop.
3. Run `pnpm build`. If it fails, report the build errors and stop.
4. Stage all changes with `git add -A`.
5. Commit:
   - If `$ARGUMENTS` is provided, use it as the commit message.
   - If `$ARGUMENTS` is empty, auto-generate a concise commit message from `git diff --cached --stat` and `git diff --cached` (summarize what changed in imperative mood, max 72 chars).
6. Run `git push origin HEAD`.
7. Report the branch name and commit hash on success.
