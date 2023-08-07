import { readSchemaFromDb } from "../src/readSchemaFromDb";
import { createTestConnection, closeTestConnection, clearDatabase } from "./testHelpers";
import { Connection } from "mysql2/promise";
import { Schema } from "../src/types";
import { automigrate } from "../src";
import { generateMigrationSQL, mapSchemaTypes } from "../src/generateMigrationSQL";

describe("migrateDb", () => {
  let connection: Connection;

  beforeEach(async () => {
    connection = await createTestConnection();
    await clearDatabase(connection);
  });

  afterEach(async () => {
    await closeTestConnection(connection);
  });

  it("reads from an empty database", async () => {
    const schema = await readSchemaFromDb(connection);
    expect(schema.tables).toHaveLength(0);
  });

  it("migrate an empty database", async () => {
    const desiredSchema: Schema = mapSchemaTypes({
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "INT", defaultValue: null },
            { name: "name", type: "VARCHAR(255)", defaultValue: null },
          ],
          indices: [{ columns: ["id"], unique: true, name: "id" }],
        },
      ],
    });

    const migration1 = generateMigrationSQL({ tables: [] }, desiredSchema);
    expect(migration1).toEqual([
      "CREATE TABLE users (id int(11), name varchar(255));",
      "CREATE UNIQUE INDEX id ON users(id);",
    ]);

    await automigrate(connection, desiredSchema);
    const schema1 = await readSchemaFromDb(connection);
    expect(schema1).toEqual(desiredSchema);

    const changedSchema: Schema = mapSchemaTypes({
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "INT", defaultValue: null },
            { name: "name", type: "VARCHAR(255)", defaultValue: null },
            { name: "admin", type: "TINYINT(1)", defaultValue: "0" },
            { name: "amount", type: "DOUBLE", defaultValue: "1" },
          ],
          indices: [
            { columns: ["id", "name"], unique: true, name: "id" },
            { columns: ["name"], unique: false, name: "name" },
          ],
        },
      ],
    });

    const migration2 = generateMigrationSQL(desiredSchema, changedSchema);
    expect(migration2).toEqual([
      "ALTER TABLE users ADD admin tinyint(1) DEFAULT 0;",
      "ALTER TABLE users ADD amount double DEFAULT 1;",
      "DROP INDEX id ON users;",
      "CREATE UNIQUE INDEX id ON users(id, name);",
      "CREATE INDEX name ON users(name);",
    ]);

    await automigrate(connection, changedSchema);
    const schema2 = await readSchemaFromDb(connection);
    expect(schema2).toEqual(changedSchema);
  });
});
