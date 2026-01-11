# Module Development Guide

This guide explains how to create and maintain modules for StackKit.

## What is a Module?

A module is a reusable component that can be integrated into projects via:

- **create-stackkit-app** - During initial project creation
- **stackkit-cli** - Added to existing projects

## Module Structure

```
modules/
└── {category}/          # auth, database, etc.
    └── {provider}/      # better-auth-nextjs, prisma-postgresql, etc.
        ├── module.json  # Module metadata and configuration
        └── files/       # Template files to copy
            ├── lib/
            ├── app/
            └── ...
```

## module.json Schema

Every module must have a `module.json` file:

```json
{
  "name": "auth", // Category name
  "displayName": "Better Auth (Next.js)", // Display name for UI
  "description": "...", // Short description
  "category": "auth", // Module category
  "provider": "better-auth", // Provider identifier
  "supportedFrameworks": ["nextjs"], // Compatible frameworks
  "compatibleDatabases": ["prisma-postgresql"], // (Optional) Required databases

  "dependencies": {
    // npm dependencies
    "better-auth": "^1.1.4"
  },

  "devDependencies": {}, // npm dev dependencies

  "envVars": [
    // Environment variables
    {
      "key": "BETTER_AUTH_SECRET",
      "value": "",
      "description": "Secret key...",
      "required": true
    }
  ],

  "patches": [
    // Files to copy/create
    {
      "type": "create-file",
      "description": "Create auth config",
      "source": "lib/auth.ts", // Source in files/ directory
      "destination": "{{lib}}/auth.ts", // Destination with placeholders
      "condition": {
        // (Optional) Conditional inclusion
        "router": "app", // Only for App Router
        "language": "typescript" // Only for TypeScript
      }
    }
  ],

  "postInstall": [
    // (Optional) Commands to run after install
    "npx prisma generate"
  ]
}
```

## Placeholder System

Use placeholders in `destination` paths for framework-agnostic modules:

| Placeholder  | Next.js                       | Express      | React (Vite) |
| ------------ | ----------------------------- | ------------ | ------------ |
| `{{lib}}`    | `lib`                         | `src`        | `src`        |
| `{{router}}` | `app` (App Router) or `pages` | `src/routes` | `src`        |
| `{{config}}` | `.` (root)                    | `.` (root)   | `.` (root)   |

Example:

```json
{
  "source": "lib/auth.ts",
  "destination": "{{lib}}/auth.ts"
}
```

Becomes:

- Next.js: `lib/auth.ts`
- Express: `src/auth.ts`

## Creating a New Module

### 1. Create Directory Structure

```bash
mkdir -p modules/{category}/{provider}/files
```

Example:

```bash
mkdir -p modules/auth/auth0-nextjs/files
```

### 2. Create module.json

```json
{
  "name": "auth",
  "displayName": "Auth0 (Next.js)",
  "description": "Auth0 authentication for Next.js",
  "category": "auth",
  "provider": "auth0",
  "supportedFrameworks": ["nextjs"],
  "dependencies": {
    "@auth0/nextjs-auth0": "^3.0.0"
  },
  "envVars": [
    {
      "key": "AUTH0_SECRET",
      "value": "",
      "description": "Auth0 secret key",
      "required": true
    },
    {
      "key": "AUTH0_BASE_URL",
      "value": "http://localhost:3000",
      "description": "Application base URL",
      "required": true
    },
    {
      "key": "AUTH0_ISSUER_BASE_URL",
      "value": "",
      "description": "Auth0 domain",
      "required": true
    },
    {
      "key": "AUTH0_CLIENT_ID",
      "value": "",
      "description": "Auth0 client ID",
      "required": true
    },
    {
      "key": "AUTH0_CLIENT_SECRET",
      "value": "",
      "description": "Auth0 client secret",
      "required": true
    }
  ],
  "patches": [
    {
      "type": "create-file",
      "description": "Create Auth0 configuration",
      "source": "lib/auth0.ts",
      "destination": "{{lib}}/auth0.ts"
    },
    {
      "type": "create-file",
      "description": "Create Auth0 API route",
      "source": "app/api/auth/[auth0]/route.ts",
      "destination": "{{router}}/api/auth/[auth0]/route.ts"
    }
  ]
}
```

### 3. Add Template Files

Create files in the `files/` directory matching the `source` paths in `patches`:

```typescript
// modules/auth/auth0-nextjs/files/lib/auth0.ts
import { initAuth0 } from '@auth0/nextjs-auth0';

export const auth0 = initAuth0({
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.AUTH0_BASE_URL!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});
```

```typescript
// modules/auth/auth0-nextjs/files/app/api/auth/[auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

### 4. Test the Module

#### Test with create-stackkit-app:

```bash
cd apps/create-stackkit
npm run build
npx . test-project
# Select your new auth module in the wizard
```

#### Test with stackkit-cli:

```bash
cd apps/stackkit-cli
npm run build
cd ../../test-project
npx ../apps/stackkit-cli/bin/stackkit.js add auth --provider auth0-nextjs
```

## Best Practices

### 1. Version Pinning

- Use specific versions (^1.0.0) not wildcards (\*)
- Test with the specified versions

### 2. Environment Variables

- Always provide descriptions
- Mark required variables
- Include example values where applicable

### 3. File Organization

- Mirror the target project structure in `files/`
- Use clear, descriptive file names
- Keep files focused and modular

### 4. Documentation

- Add comments in template files
- Explain complex configurations
- Include setup instructions in descriptions

### 5. Framework Compatibility

- Test with all supported frameworks
- Use placeholders for path differences
- Handle framework-specific code with conditions

### 6. Database Integration

- Specify `compatibleDatabases` if needed
- Don't assume database is present unless listed
- Provide fallback configurations

## Module Categories

### Auth Modules

- Authentication and authorization
- User management
- Session handling
- OAuth providers

**Location**: `modules/auth/`

**Example providers**: better-auth-nextjs, clerk-nextjs, auth0-nextjs

### Database Modules

- Database clients and ORMs
- Schema definitions
- Connection management
- Migration tools

**Location**: `modules/database/`

**Example providers**: prisma-postgresql, mongoose-mongodb

## Common Patterns

### Multi-Framework Support

Create separate modules per framework:

```
modules/auth/
├── better-auth-nextjs/
├── better-auth-express/
└── better-auth-react/
```

Each has its own module.json tailored to that framework.

### Database-Dependent Auth

```json
{
  "compatibleDatabases": ["prisma-postgresql", "prisma-mongodb"],
  "patches": [
    {
      "type": "create-file",
      "source": "lib/auth.ts",
      "destination": "{{lib}}/auth.ts",
      "condition": {
        "hasDatabase": true
      }
    }
  ]
}
```

### Router-Specific Files

```json
{
  "patches": [
    {
      "type": "create-file",
      "source": "app/layout.tsx",
      "destination": "{{router}}/layout.tsx",
      "condition": {
        "router": "app"
      }
    },
    {
      "type": "create-file",
      "source": "pages/_app.tsx",
      "destination": "{{router}}/_app.tsx",
      "condition": {
        "router": "pages"
      }
    }
  ]
}
```

## Updating Existing Modules

1. Update `module.json` with new metadata
2. Update files in `files/` directory
3. Increment versions in dependencies
4. Test with both CLIs
5. Document breaking changes

## Publishing Modules

Modules are published as part of the CLI packages:

1. Commit module to `modules/` directory
2. Both CLIs will copy modules during build
3. Modules are included in npm packages
4. Users get latest modules with CLI updates

## Troubleshooting

### Module Not Found

- Check module.json exists
- Verify category and provider match
- Ensure proper directory structure

### Files Not Copying

- Verify `source` paths in module.json
- Check files exist in `files/` directory
- Test placeholder replacements

### Dependency Issues

- Pin specific versions
- Test npm install separately
- Check for peer dependencies

### Framework Compatibility

- Test on actual framework projects
- Verify placeholder resolution
- Check condition logic

## Examples

See existing modules for reference:

- Simple: `modules/auth/clerk-nextjs/`
- Database-integrated: `modules/auth/better-auth-nextjs/`
- Complex: `modules/database/prisma-postgresql/`

## Need Help?

- Check existing modules for patterns
- Review [ARCHITECTURE.md](../ARCHITECTURE.md)
- Open an issue on GitHub
