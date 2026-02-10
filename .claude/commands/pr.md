# Create Pull Request

Create a GitHub PR for the current branch.

**Allowed tools:** Bash, Read only. Do NOT edit any files.

## Preconditions — abort with a clear message if any fail

1. Current branch must NOT be `main`. Run `git branch --show-current` to check.
2. Working tree must be clean. Run `git status --porcelain` — if output is non-empty, abort and tell the user to commit or stash changes first.

## Steps

1. Determine the current branch name and the base branch (`main`).
2. If the branch has no upstream, push it with `git push -u origin HEAD`.
3. Get the full diff and commit log for all commits on this branch vs main:
   - `git log main..HEAD --oneline`
   - `git diff main...HEAD --stat`
   - `git diff main...HEAD` (read for context, but don't dump the full diff to the user)
4. Analyze ALL commits (not just the latest) to understand the full scope of changes.
5. Auto-generate:
   - **Title**: under 70 characters, imperative mood, summarizing all changes.
   - **Body** using this template:

```
## Summary
- <bullet point 1>
- <bullet point 2>
- <bullet point 3 if needed>

## Test Plan
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

6. Create the PR: `gh pr create --title "<title>" --body "<body>"`.
7. Report the PR URL.
