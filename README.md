# StackKit

⚡ Production-ready CLI toolkit for generating modular web projects

[![npm](https://img.shields.io/npm/v/stackkit)](https://www.npmjs.com/package/stackkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

One-line: scaffold production-ready applications with composable modules and sensible defaults.

## Requirements

- Node: >= 20 (see `package.json` engines)
- pnpm: >= 8 (recommended)

## Quick Start

Create a new project without installing globally:

```bash
npx stackkit@latest create my-app
```

Add modules to an existing project:

```bash
npx stackkit@latest add auth
npx stackkit@latest add database
```

Check project health:

```bash
npx stackkit@latest doctor
```

## Development

Clone and run locally:

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install
pnpm build
pnpm dev
```

Notes:

- Commands run across the workspace using pnpm workspaces where applicable.
- Use `pnpm -w -r run <script>` to target workspace scripts explicitly.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and code style.

When opening issues or pull requests, please include relevant details (version, Node, package manager, OS, command, reproduction steps).

## Support & Security

- For general questions or feature requests: open an issue or discussion on GitHub.
- For security-sensitive reports: use GitHub Security Advisories (private) or open an issue and mark it with the `security` label — do not post exploit details publicly.

## License

MIT © [Tariqul Islam](https://github.com/tariqul420)

---

Questions? Open an [issue](https://github.com/tariqul420/stackkit/issues) or start a discussion.
