# New Changes: Backend Local Authentication

## Overview
Added a new **Backend Local Authentication** feature to StackKit. This allows users to generate a project with a custom local authentication system using email/username and password, integrated with Mongoose and Express.

## Feature Added
- **Backend Local Authentication**: A custom auth implementation using `bcrypt` for password hashing and `mongoose` for user storage.

## Files Created
- `modules/auth/local-auth/module.json`: Module metadata.
- `modules/auth/local-auth/generator.json`: Generation logic and operations.
- `modules/auth/local-auth/files/express/modules/auth/auth.controller.ts`: Login and Register controllers.
- `modules/auth/local-auth/files/express/modules/auth/auth.interface.ts`: TypeScript interfaces for the User model.
- `modules/auth/local-auth/files/express/modules/auth/auth.model.ts`: Mongoose User schema and methods.
- `modules/auth/local-auth/files/express/modules/auth/auth.route.ts`: Authentication routes.

## Files Modified
- `templates/express/template.json`: Added `local-auth` to compatible auth options.
- `templates/nextjs/template.json`: Added `local-auth` to compatible auth options.
- `templates/react/template.json`: Added `local-auth` to compatible auth options.

## CLI Changes
- New authentication option: `local-auth` (or `local`).
- Users can now select "Local Auth" when prompted for authentication.
- CLI flag `--auth local-auth` is now supported.

## Supported Frameworks
- **Express.js**: Full integration with Mongoose.
- **Next.js & React**: Option added to CLI (Frontend implementation to be extended).

## Dependencies Added
### Express.js
- `bcrypt`: `^5.1.1`
- `cookie-parser`: `^1.4.7`
- `http-status`: `^2.1.0`
- `@types/bcrypt`: `^5.0.2`
- `@types/cookie-parser`: `^1.4.7`

## Configuration Notes
- Requires a Mongoose-compatible database (MongoDB).
- No additional environment variables required for basic setup beyond standard DB config.

## Testing Instructions
1. Run `stackkit create my-app`
2. Select `Express.js` as the framework.
3. Select `Mongoose` as the database.
4. Select `Local Auth` as the authentication.
5. Verify that `src/modules/auth` contains the authentication logic.
6. Verify that `src/routes/index.ts` has the auth routes registered.
7. Run `npm install` and `npm run dev` to start the server.
8. Test `POST /api/v1/auth/register` and `POST /api/v1/auth/login` endpoints.
