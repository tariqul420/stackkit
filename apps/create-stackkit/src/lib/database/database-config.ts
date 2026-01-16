export const DATABASE_CONNECTION_STRINGS = {
  postgresql: "postgresql://user:password@localhost:5432/mydb?schema=public",
  mongodb: "mongodb://localhost:27017/mydb",
  mysql: "mysql://user:password@localhost:3306/mydb",
  sqlite: "file:./dev.db",
} as const;