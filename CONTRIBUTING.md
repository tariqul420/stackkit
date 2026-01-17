# Contributing to StackKit

Thank you for contributing! We welcome bug reports, feature requests, and pull requests.

For detailed contributing guide, see [Online Docs](https://stackkit.tariqul.dev/docs/community/contributing).

## Quick Start

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install && pnpm build
```

## Adding a Module

1. Create directory: `modules/{category}/{provider}/`
2. Add `module.json` configuration
3. Add template files in `files/` subdirectory
4. Test with CLI: `npx stackkit add {module}`
5. Submit PR

## Testing

```bash
# Test new project creation
cd apps/stackkit && npm run build
node bin/stackkit.js my-test-app

# Test module addition
cd apps/stackkit && npm run build
cd /tmp/my-test-app
node /path/to/bin/stackkit.js add auth
```

## Code Standards

- Use TypeScript
- Follow existing patterns
- Add error handling
- Test before submitting

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add stripe module
fix: resolve path issue
docs: update guide
```

## Pull Requests

1. Fork and create branch
2. Make changes and test
3. Update docs if needed
4. Submit PR with clear description

## Need Help?

- [Discussions](https://github.com/tariqul420/stackkit/discussions)
- [Issues](https://github.com/tariqul420/stackkit/issues)
