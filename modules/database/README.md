# Database Modules

This directory contains database provider modules for StackKit.

## Structure

Each database module follows this standard structure:

```
database-provider/
├── module.json          # Module configuration
└── files/              # Template files to be copied
    ├── lib/           # Database client/connection files
    └── prisma/        # Prisma schema (for Prisma modules)
```

## Module Configuration (`module.json`)

Standard fields for all database modules:

```json
{
  "name": "provider-database",
  "displayName": "Provider + Database",
  "description": "Brief description",
  "category": "database",
  "provider": "orm-name",
  "database": "database-name",
  "supportedFrameworks": ["framework1", "framework2"],
  "dependencies": {},
  "devDependencies": {},
  "envVars": [],
  "frameworkPatches": {},
  "patches": [],
  "postInstall": []
}
```

## Available Modules

### Prisma
- **prisma-postgresql**: Prisma ORM with PostgreSQL
- **prisma-mongodb**: Prisma ORM with MongoDB

### Mongoose
- **mongoose-mongodb**: Mongoose ODM with MongoDB

## Framework Patches

Database modules can include framework-specific patches for `tsconfig.json`:

```json
"frameworkPatches": {
  "express": {
    "tsconfig.json": {
      "merge": {
        "compilerOptions": {
          "paths": {
            "@/*": ["./src/*"]
          }
        },
        "exclude": ["node_modules", "dist", "prisma/migrations"]
      }
    }
  },
  "nextjs": {
    "tsconfig.json": {
      "merge": {
        "exclude": ["prisma/migrations"]
      }
    }
  }
}
```

## Schema Files

Database module schemas should be **auth-agnostic**. They provide basic connection setup and example models.

Auth providers that need specific database schemas should include them in their own `adapters/` directory.

Example generic schema:
```prisma
// Example model - customize based on your auth provider
model User {
    id        String   @id @default(cuid())
    email     String   @unique
    name      String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

## Post-Install Commands

Database modules can specify commands to run after installation:

```json
"postInstall": ["npx prisma generate"]
```

## Adding New Database Modules

1. Create directory: `modules/database/provider-database/`
2. Add `module.json` with standard fields
3. Create `files/` directory with:
   - Database connection/client file
   - Schema file (if applicable)
4. Add framework-specific patches if needed
5. Update main CLI to recognize the new database option
