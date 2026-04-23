# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the TypeScript CLI source. Keep command handlers in `src/commands/` (`install.ts`, `enable.ts`, `status.ts`) and shared logic in `src/utils/`. `bin/cli.js` is the executable entry point, while `dist/` is generated output from `tsc` and should not be edited by hand. Static packaged content lives in `assets/`: reusable agent prompts in `assets/agents/`, slash commands in `assets/commands/`, architecture references in `assets/architecture/`, and skill definitions in `assets/skills/`. Helper scripts belong in `scripts/`.

## Build, Test, and Development Commands

- `bun install` or `npm install`: install dependencies.
- `bun run build` or `npm run build`: compile `src/` into `dist/` with TypeScript.
- `bun run dev`: watch-mode compilation during CLI development.
- `bun link`: expose the local `moicle` binary for manual testing.
- `moicle install --project`: verify packaged assets install into `./.claude/`.
- `npm run pack:dist`: assemble the release zip under `release/moicle.zip`.

## Coding Style & Naming Conventions

Use TypeScript with ES modules and strict compiler settings from `tsconfig.json`. Match the existing style: 2-space indentation, semicolons, single quotes, and small focused modules. Name command files with concise verbs (`install.ts`, `disable.ts`) and keep exported types in `src/types.ts`. Markdown assets should use lowercase kebab-case names such as `react-frontend.md` or `review-changes/SKILL.md`.

## Testing Guidelines

There is no automated test suite yet; `npm test` is currently a placeholder. Until real tests exist, validate changes by running `npm run build`, then exercise the CLI flows you touched with `bun link` and commands like `moicle list` or `moicle status`. If you add tests, place them alongside the future test setup and name them after the behavior they cover, for example `install-command.test.ts`.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits: `feat: ...`, `feat(skills): ...`, `chore(release): ...`. Keep subjects imperative and scoped when useful. Pull requests should include a short summary, note any affected CLI commands or asset folders, link related issues, and paste terminal output or screenshots when interactive prompts change.

## Release Notes

Do not bump `package.json` versions manually. Use the GitHub Actions release workflow described in `RELEASE.md` or `gh workflow run publish.yml -f release-type=patch -f dist-tag=latest`.
