import mysql from "mysql2/promise";
import { Schema } from "./types";
import { readSchemaFromDb } from "./readSchemaFromDb";
import { generateMigrationSQL } from "./generateMigrationSQL";
import { executeMigrations } from "./executeMigrations";

export async function automigrate(
  connection: mysql.Connection,
  desiredSchema: Schema
): Promise<void> {
  const currentSchema = await readSchemaFromDb(connection);
  const sqlStatements = generateMigrationSQL(currentSchema, desiredSchema);
  if (sqlStatements.length > 0) {
    await executeMigrations(connection, sqlStatements);
  }
}
