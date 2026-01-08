# Changelog

All notable changes to this project.

## [0.4.0] - 2026-01-08

### Changed

- **BREAKING**: Unified module system - `/modules` now single source of truth
- Removed duplicate `/templates/auth` and `/templates/databases`
- Both CLIs now use shared `/modules` directory
- Standardized `module.json` format across all modules
- Updated Better Auth with Prisma integration

### Added

- Comprehensive documentation (ARCHITECTURE.md, MODULE_GUIDE.md)
- Module validation utilities
- Placeholder system for framework-agnostic paths

### Fixed

- Eliminated code duplication
- Consistent behavior between create-stackkit-app and stackkit-cli

## [0.3.2] - 2024-01-XX

### Added

- Initial module system
- Base templates for Next.js, Express, React
- Auth modules: Better Auth, Auth.js, NextAuth, Clerk
- Database modules: Prisma, Drizzle, Mongoose

## [0.3.0] - 2024-01-XX

### Added

- Initial release of create-stackkit-app
- Initial release of stackkit-cli
