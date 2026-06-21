# Concurrent Development Rules

Rules for safe multi-agent and multi-developer parallel work in this repository.

## Branch Strategy

| Work type | Branch pattern | Example |
|-----------|---------------|---------|
| Feature phase | `phase/<N>/<feature>` | `phase/0/scaffold-monorepo` |
| Bug fix | `fix/<short-desc>` | `fix/streaming-race` |
| Agent task | `agent/<persona>/<task>` | `agent/frontend/chat-ui` |
| Experiment | `spike/<topic>` | `spike/mcp-cold-start` |

## File Ownership Boundaries

To minimize merge conflicts, parallel work MUST respect layer boundaries:

| Layer | Owned paths | Primary persona |
|-------|-------------|-----------------|
| 1 — Web App | `apps/web/app/`, `apps/web/components/` | frontend-engineer |
| 2 — Chatbot | `apps/web/app/api/chat/`, `packages/shared/chat-types/` | frontend-engineer + backend-engineer |
| 3 — Agent | `packages/agent/` | backend-engineer |
| 4 — Control | `packages/control/` | backend-engineer |
| 5 — Integrations | `packages/integrations/` | backend-engineer |
| 6 — API/Providers | `packages/providers/` | backend-engineer |
| 7 — Context | `packages/context/`, `resource/` | backend-engineer |
| Shared types | `packages/shared/` | shared (coordinate) |
| Database | `packages/db/` | backend-engineer |
| Config files | root `*.config.*`, `docker-compose.yml` | shared (coordinate) |
| Design docs | `doc/` | any (non-blocking) |

## Concurrency Rules

1. **One branch per task.** Never have two agents editing the same branch simultaneously.
2. **Layer isolation.** Parallel agents MUST work on different layers/packages. Cross-layer work is sequential.
3. **Shared files require coordination.** Files in `packages/shared/`, root configs, and `packages/db/migrations/` are coordination points — only one agent modifies them at a time.
4. **Lock before write.** Before editing a shared file, check `git status` and announce intent. If another agent has uncommitted changes to the same file, wait or coordinate.
5. **Small, frequent commits.** Commit after each logical unit (one function, one component, one test). This reduces merge conflict surface.
6. **Rebase before merge.** Always rebase feature branch onto `main` before creating PR. Resolve conflicts in the feature branch, never in `main`.
7. **No force-push on shared branches.** Only force-push on personal/agent branches that no one else is using.

## Agent-Specific Rules

When AI agents work in parallel:

1. **Report branch state.** Every agent report must include: branch name, files changed, verification status, known conflicts.
2. **Read-only by default.** Fan-out personas (e.g., `/ship` reviewers) are read-only. Only implementation agents write code.
3. **Dedicated worktrees preferred.** For true parallelism, use `git worktree` so agents don't interfere with each other's working directory.
4. **Main session owns merge.** Subagents never merge. The main session or human reviews and merges.
5. **Conflict resolution is human-approved.** If a merge conflict arises, present both versions to the human for decision.

## Migration and Schema Coordination

Database migrations are inherently sequential:

1. Only one migration file per PR.
2. Migration filenames use timestamps (not sequential numbers) to reduce naming conflicts.
3. If two branches need migrations, the second branch must rebase and adjust after the first merges.
4. Schema changes in `packages/db/schema/` require review from both frontend and backend engineers.

## Design Doc Coordination

Design documents in `doc/` are non-blocking:
- Multiple agents can propose doc changes on separate branches.
- ADR numbers are assigned at merge time to avoid conflicts.
- Diagram source files (`.mmd`) may be edited in parallel if touching different diagrams.

## Verification Before Merge

Every branch must pass before merge:
- [ ] `pnpm typecheck` (when code exists)
- [ ] `pnpm test` (when tests exist)
- [ ] `pnpm lint` (when linter configured)
- [ ] No unresolved merge conflicts
- [ ] Branch is rebased on latest `main`
