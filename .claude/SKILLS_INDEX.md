# Skills Index
<!-- grep this file to find the right skill for any task -->
<!-- Format: skill-name | PHASE | one-line purpose | trigger keywords -->

## Discovery
deep-research             | Discovery    | Citation-backed 7-phase research with GoT       | research, investigate, deep dive, literature review, market analysis, technology assessment, comprehensive report
interview-me              | Discovery    | Extract true intent via one-Q-at-a-time interview | underspecified ask, grill me, stress-test thinking, "build me X" without context, what do you really want
idea-refine               | Discovery    | Diverge then converge on vague ideas             | ideate, refine this idea, stress-test my plan, expand options, brainstorm options

## Design
spec-driven-development   | Design       | Write spec before any code                       | new project, no spec yet, requirements unclear, ambiguous ask, spec first
domain-driven-design      | Design       | Bounded contexts, aggregates, ubiquitous language | domain modeling, bounded context, aggregate root, DDD, microservice boundary, context map
api-design                | Design       | REST patterns, status codes, pagination, errors  | REST API, resource naming, error responses, versioning, rate limiting, OpenAPI
drawio                    | Design       | Draw.io diagrams from text / Mermaid             | diagram, architecture diagram, flowchart, UML, ER diagram, sequence diagram, mermaid to drawio, 画图
gstack-design-consultation| Design       | Full design system → DESIGN.md                  | design system, brand guidelines, create DESIGN.md, UI from scratch, typography, color palette
ui-ux-pro-max             | Design       | UI/UX with 50 styles, shadcn/ui, Tailwind        | component design, Tailwind, shadcn, glassmorphism, dark mode, responsive, button, modal, chart, color

## Architecture
api-and-interface-design  | Architecture | Stable API/interface contracts at module boundaries | API design, module boundary, type contract, frontend/backend boundary, public interface
software-design-philosophy| Architecture | Deep modules, info hiding, complexity budget      | deep module, shallow class, complexity budget, information leakage, pass-through method, strategic vs tactical
pragmatic-programmer      | Architecture | DRY, tracer bullets, build-vs-buy decisions      | DRY, orthogonality, tracer bullet, software craftsmanship, technical debt prevention, estimation, reversible
documentation-and-adrs    | Architecture | Record decisions as ADRs for future context      | ADR, architectural decision, record decision, document API change, future engineers
gstack-plan-eng-review    | Architecture | Pre-coding engineering plan review               | review architecture, engineering review, lock in the plan, catch architecture issues before coding

## Planning
planning-and-task-breakdown | Planning   | Break spec into ordered implementable tasks      | break down tasks, estimate scope, parallel work, task list, too large to start
incremental-implementation  | Planning   | Deliver multi-file changes in safe steps         | incremental, large change, multi-file, step by step, too much to land at once
context-engineering         | Planning   | Optimise agent context setup and rules files     | new session, context setup, agent quality degraded, switch tasks, configure rules files

## Build
frontend-ui-engineering   | Build        | Production-quality UI — not AI-generated look    | build UI, React component, layout, state management, production quality, polished
clean-code                | Build        | Readable code, naming, SRP, comment discipline   | code review, naming conventions, function too long, code smells, SRP, readable code, boy scout rule
source-driven-development | Build        | Implement from official docs, cite sources       | authoritative docs, no outdated patterns, cite official, correct API usage
test-driven-development   | Build        | TDD — write failing test first                   | write tests first, TDD, prove code works, RED-GREEN-REFACTOR, bug fix with tests
doubt-driven-development  | Build        | Adversarial review for high-stakes decisions     | high stakes, security logic, irreversible operation, correctness matters, unfamiliar code
security-and-hardening    | Build        | Harden against OWASP Top 10                     | user input, authentication, XSS, SQL injection, CSRF, rate limiting, OWASP, untrusted data

## Quality
code-review-and-quality   | Quality      | Multi-axis code review before merge              | before merge, code review, multi-axis review, assess code quality, PR review
gstack-review             | Quality      | PR diff — SQL safety, LLM trust, side-effects   | pre-landing review, check my diff, SQL safety, LLM trust boundary, conditional side effects
performance-optimization  | Quality      | Fix perf regressions, Core Web Vitals            | performance regression, Core Web Vitals, load time, profiling, bundle size, slow
refactoring-patterns      | Quality      | Named safe refactoring transformations           | refactor, extract method, code smells, decompose conditional, move method, technical debt
code-simplification       | Quality      | Simplify without changing behaviour              | simplify code, reduce complexity, hard to read, too complex, unnecessary abstraction

## Debug
debugging-and-error-recovery | Debug     | Systematic root-cause debugging process          | test fails, build breaks, unexpected behavior, root cause, systematic debug, error recovery

## Ship
ci-cd-and-automation      | Ship         | CI/CD pipelines, quality gates, deployment       | CI/CD pipeline, build automation, quality gates, test runners in CI, deployment strategy
git-workflow-and-versioning| Ship        | Branch, commit, PR workflow                      | commit, branch, merge conflict, PR, git workflow, conventional commits
shipping-and-launch       | Ship         | Pre-launch checklist, staged rollout, rollback   | production deploy, pre-launch checklist, staged rollout, rollback strategy, monitoring

## Meta
using-agent-skills        | Meta         | Discover and invoke the right skill              | discover skills, which skill to use, session start, meta-skill, find skill
strategic-compact         | Meta         | Manual context compaction at phase boundaries    | context compaction, context window filling, manual compact, preserve context

## Phase-Gated  (in .claude/skills/.inactive/ — move to skills/ to activate)
gstack                    | Phase 1+     | Headless browser QA / site dogfooding            | open browser, test site, screenshot, dogfood user flow, verify deployment
browser-testing-with-devtools | Phase 1+ | Real browser via Chrome DevTools MCP             | inspect DOM, console errors, network requests, browser testing, DevTools
gstack-design-review      | Phase 2+     | Visual QA + fix loop on live site                | visual QA, audit design, check if it looks good, design polish, AI slop, spacing issues
gstack-design-html        | Phase 2+     | Generate production HTML from approved mockup    | finalize design, turn into HTML, implement design, Pretext
gstack-design-shotgun     | Phase 5      | Multiple AI design variants + comparison board  | design variants, explore designs, visual brainstorm, show me options, I don't like how this looks
gstack-office-hours       | Phase 5      | YC-style product idea brainstorm                 | I have an idea, brainstorm, office hours, is this worth building, new product idea
gstack-plan-ceo-review    | Phase 5      | CEO scope/ambition review                        | think bigger, expand scope, strategy review, CEO review, is this ambitious enough
gstack-investigate        | Any          | Systematic root-cause + fix (gstack variant)     | debug this, fix this bug, root cause analysis, 500 error, it was working yesterday
deprecation-and-migration | Phase 4+     | Deprecate APIs, migrate users off old system     | remove old system, migrate users, sunset feature, migration path, breaking change
