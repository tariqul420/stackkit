# Contributing to StackKit

Thank you for taking the time to contribute! We welcome bug reports, feature requests, and pull requests from everyone.

For the full contributing guide, see the [documentation](https://stackkit.tariqul.dev/docs/community/contributing).

## Getting started

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install && pnpm build
```

## Adding a module

1. Create the directory: `modules/{category}/{provider}/`
2. Add a `module.json` configuration file
3. Add template files in a `files/` subdirectory
4. Test with the CLI: `npx stackkit@latest add`
5. Submit a pull request

## Testing your changes

```bash
# Test project creation
cd apps/stackkit && npm run build
node bin/stackkit.js my-test-app

# Test module addition
cd /tmp/my-test-app
node /path/to/bin/stackkit.js add
```

## Code style

- Use TypeScript
- Follow existing patterns in the codebase
- Add error handling where appropriate
- Test before submitting

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add stripe payment module
fix: resolve template path resolution
docs: update quickstart guide
chore: bump dependency versions
```

## Pull requests

1. Fork the repo and create a branch from `main`
2. Make your changes and test them
3. Update docs if your change is user-facing
4. Open a PR with a clear description of what changed and why

## Questions or bugs?

- [GitHub Discussions](https://github.com/tariqul420/stackkit/discussions) — general questions and ideas
- [GitHub Issues](https://github.com/tariqul420/stackkit/issues) — bug reports and feature requests
- [Discord](https://discord.gg/PD8XWdpA) — chat and community
