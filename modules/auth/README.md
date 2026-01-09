# Auth Modules

This directory contains authentication provider modules for StackKit.

## Structure

Each auth module follows this standard structure:

```
auth-provider-framework/
├── module.json          # Module configuration
├── files/              # Template files to be copied
│   ├── lib/           # Library/utility files
│   └── app/           # Framework-specific files
└── adapters/          # Database-specific adapters (for providers that need database)
    ├── [db]-adapter.ts
    └── [db]-schema.prisma (if applicable)
```

## Module Configuration (`module.json`)

Standard fields for all auth modules:

```json
{
  "name": "auth-provider-framework",
  "displayName": "Provider Name (Framework)",
  "description": "Brief description",
  "category": "auth",
  "provider": "provider-name",
  "supportedFrameworks": ["framework"],
  "dependencies": {},
  "devDependencies": {},
  "envVars": [],
  "patches": [],
  "databaseAdapters": {}  // Only for providers requiring database
}
```

## Available Modules

### Better Auth
- **better-auth-nextjs**: Next.js App Router integration with database support
- **better-auth-express**: Express.js integration with database support
- **better-auth-react**: React client-side authentication

### Clerk
- **clerk-nextjs**: Next.js App Router integration (managed service)
- **clerk-express**: Express.js integration (managed service)
- **clerk-react**: React integration (managed service)

## Database Integration

Auth providers that require database storage (like Better Auth) include:

1. **adapters/** directory with database-specific configurations
2. **databaseAdapters** in module.json mapping database types to adapter files
3. Schema files for each supported database (e.g., `prisma-postgresql-schema.prisma`)

Example:
```json
"databaseAdapters": {
  "prisma-postgresql": {
    "adapter": "adapters/prisma-postgresql.ts",
    "schema": "adapters/prisma-postgresql-schema.prisma",
    "schemaDestination": "prisma/schema.prisma",
    "dependencies": {
      "@better-auth/prisma": "^1.1.4"
    }
  }
}
```

## Adding New Auth Modules

1. Create directory: `modules/auth/provider-framework/`
2. Add `module.json` with standard fields
3. Create `files/` directory with template files
4. If database required, add `adapters/` with configurations
5. Update main CLI to recognize the new provider
