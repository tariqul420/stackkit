# Auth Modules

This directory contains authentication provider modules for StackKit.

## Structure

Each auth module follows this standard structure:

```
auth-provider-framework/
├── module.json          # Module configuration
├── files/              # Template files to be copied
│   ├── lib/           # Library/utility files
│   ├── api/           # API route files (framework-specific)
│   ├── routes/        # Route files (framework-specific)
│   └── schemas/       # Database schema files (for multi-database support)
└── adapters/          # Database-specific adapter configurations
    └── [db]-adapter.ts
```

**Directory Purpose:**
- `files/`: Contains all template files that will be copied to user's project
  - `files/lib/`: Auth configuration and utility files
  - `files/schemas/`: Database schema files (Prisma, etc.)
- `adapters/`: Contains database-specific configuration code (TypeScript files only)
- `module.json`: Module metadata and configuration

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

1. **adapters/** directory with database-specific TypeScript configurations
2. **files/schemas/** directory with database schema files (e.g., Prisma schemas)
3. **databaseAdapters** in module.json mapping database types to adapter and schema files

**File Organization:**
- `adapters/*.ts` - Database adapter configuration code
- `files/schemas/*.prisma` - Prisma schema files for different databases
- `files/lib/` - Auth library files that use the adapters

Example structure:
```
better-auth-express/
├── adapters/
│   ├── prisma-postgresql.ts     # Adapter config
│   ├── prisma-mongodb.ts         # Adapter config
│   └── mongoose-mongodb.ts       # Adapter config
├── files/
│   ├── schemas/
│   │   ├── prisma-postgresql-schema.prisma
│   │   └── prisma-mongodb-schema.prisma
│   ├── lib/
│   │   └── auth.ts              # Uses adapter from adapters/
│   └── routes/
│       └── auth.ts
└── module.json
```

Example module.json configuration:
```json
"databaseAdapters": {
  "prisma-postgresql": {
    "adapter": "adapters/prisma-postgresql.ts",
    "schema": "files/schemas/prisma-postgresql-schema.prisma",
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
