# Advanced Template Syntax Guide

StackKit uses a powerful template system that allows you to create dynamic, conditional content based on project configuration. This guide explains all available syntax options.

## Best Practices

### Self-Contained Templates

For better maintainability and readability, place conditional logic directly in template files rather than using patch operations in `generator.json`. This makes it easier to understand what conditions apply to each part of the code.

**✅ Good: Conditional logic in template**
```typescript
import { betterAuth } from "better-auth";
{{#if database=='prisma'}}
import { prisma } from "{{framework=='nextjs' ? '@/lib' : '.'}}/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
{{/if}}
{{#if database=='mongoose'}}
import { mongoClient, db } from "{{framework=='nextjs' ? '@/lib' : '.'}}/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/if}}

export const auth = betterAuth({
{{#if database=='prisma'}}
  database: prismaAdapter(prisma),
{{/if}}
{{#if database=='mongoose'}}
  database: mongodbAdapter(db),
{{/if}}
  // ... rest of config
});
```

**❌ Avoid: Patch operations in generator.json**
```json
{
  "type": "patch-file",
  "operations": [
    {
      "type": "add-import",
      "imports": ["{{#if database=='prisma'}}import { prismaAdapter } from \"better-auth/adapters/prisma\";{{/if}}"]
    }
  ]
}
```

## Variable Replacement

### Simple Variables
```
{{variableName}}
```
Replaces with the value of `variableName` from the context.

### Ternary Expressions
```
{{framework=='nextjs' ? '@/lib' : '.'}}
```
If framework equals 'nextjs', outputs '@/lib', otherwise outputs '.'.

### Switch Expressions
```
{{switch dbProvider postgresql: @default(cuid()), mysql: @default(uuid()), sqlite: @default(uuid()), default: @default(cuid())}}
```
Outputs different values based on the `dbProvider` value.

### Conditional Expressions
```
{{if dbProvider==postgresql then:@default(cuid()) else:@default(uuid())}}
```
If condition is met, outputs the 'then' value, otherwise the 'else' value.

## Conditional Blocks

### Simple If Blocks
```
{{#if framework=='nextjs'}}
// Next.js specific code
{{/if}}
```

### Advanced If Blocks with Operators
```
{{#if dbProvider == postgresql}}
@default(cuid())
{{/if}}
{{#if dbProvider == mysql}}
@default(uuid())
{{/if}}
{{#if dbProvider includes socialAuth}}
// Social auth code
{{/if}}
```

Supported operators:
- `==`, `===` - equals
- `!=`, `!==` - not equals
- `includes` - array contains value
- `startsWith` - string starts with
- `endsWith` - string ends with

### Switch Blocks
```
{{#switch dbProvider}}
{{#case postgresql}}
@default(cuid())
{{/case}}
{{#case mysql}}
@default(uuid())
{{/case}}
{{#case default}}
@default(cuid())
{{/case}}
{{/switch}}
```

## Feature Flags

```
{{feature:emailVerification}}
```
Outputs 'true' if 'emailVerification' is in the features array, 'false' otherwise.

## Context Variables

The following variables are available in templates:

### Framework Variables
- `framework` - The selected framework ('nextjs', 'express', 'react-vite')
- `isNextJs` - Boolean, true if framework is 'nextjs'
- `isExpress` - Boolean, true if framework is 'express'
- `isReactVite` - Boolean, true if framework is 'react-vite'

### Database Variables
- `database` - The selected database ('prisma', 'mongoose', 'none')
- `dbProvider` - The database provider ('postgresql', 'mysql', 'mongodb', 'sqlite')
- `hasDatabase` - Boolean, true if database is not 'none'

### Auth Variables
- `auth` - The selected auth system ('better-auth', 'authjs', 'none')
- `hasAuth` - Boolean, true if auth is not 'none'

### Other Variables
- `features` - Array of selected features
- `language` - Selected language ('typescript', 'javascript')
- `packageManager` - Selected package manager ('pnpm', 'npm', 'yarn', 'bun')
- `projectName` - The project name

## Examples

### Database-Specific ID Defaults
```prisma
model User {
    id String @id {{#if dbProvider == postgresql}}@default(cuid()){{/if}}{{#if dbProvider == mysql}}@default(uuid()){{/if}}
    email String @unique
}
```

### Framework-Specific Imports
```typescript
{{#if framework == nextjs}}
import { NextRequest } from 'next/server';
{{/if}}
{{#if framework == express}}
import express from 'express';
{{/if}}
```

### Feature-Conditional Code
```typescript
{{#if features includes emailVerification}}
// Email verification setup
{{/if}}
```

### Switch-Based Configuration
```json
{
  "database": "{{switch dbProvider postgresql: postgresql, mysql: mysql, mongodb: mongodb, default: sqlite}}"
}
```

This system allows you to create highly dynamic templates that adapt to any combination of framework, database, auth, and features without requiring code changes.</content>
<parameter name="filePath">/home/tariqul/Projects/open-source/stackkit/modules/auth/better-auth/TEMPLATE_SYNTAX.md