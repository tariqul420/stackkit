# Contributing to StackKit

Thank you for contributing! We welcome bug reports, feature requests, and pull requests.

## Quick Start

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install && pnpm build
```

## Adding a Module

1. Create directory: `modules/{category}/{provider}/`
2. Add `module.json` (see [MODULE_GUIDE.md](docs/MODULE_GUIDE.md))
3. Add files in `files/` subdirectory
4. Test with both CLIs
5. Submit PR

## Testing

```bash
# Test create-stackkit-app
cd apps/create-stackkit && npm run build
node bin/create-stackkit.js my-test-app

# Test stackkit-cli  
cd apps/stackkit-cli && npm run build
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

Thank you! 🚀
