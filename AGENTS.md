# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the TypeScript CLI source. Keep command handlers in `src/commands/` (`enable.ts`, `status.ts`; `install/` is a multi-file module) and shared logic in `src/utils/`. `bin/cli.js` is the executable entry point, while `dist/` is generated output from `tsc` and should not be edited by hand. Static packaged content lives in `assets/`: reusable agent prompts in `assets/agents/`, slash commands in `assets/commands/`, architecture references in `assets/architecture/`, and skill definitions in `assets/skills/`. Helper scripts belong in `scripts/`.

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

`npm test` runs `bun run build && bun test` (Bun's built-in runner — no extra test deps). Tests live under `test/`: `test/unit/` covers pure functions in `src/utils/` and helpers; `test/integration/` spawns the built CLI against temp dirs (`fs.mkdtemp`) and asserts real file trees — never touch a real `~/.claude` or call the network. Name files after the behavior they cover, e.g. `install-command.test.ts`. For manual smoke checks, `bun link` + `moicle install --project` still works.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits: `feat: ...`, `feat(skills): ...`, `chore(release): ...`. Keep subjects imperative and scoped when useful. Pull requests should include a short summary, note any affected CLI commands or asset folders, link related issues, and paste terminal output or screenshots when interactive prompts change.

## Release Notes

Do not bump `package.json` versions manually. Use the GitHub Actions release workflow described in `RELEASE.md` or `gh workflow run publish.yml -f release-type=patch -f dist-tag=latest`.
