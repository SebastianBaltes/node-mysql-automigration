import { readSchemaFromDb } from "../src/readSchemaFromDb";
import { createTestConnection, closeTestConnection, clearDatabase } from "./testHelpers";
import { Connection } from "mysql2/promise";
import { Schema } from "../src/types";
import { automigrate } from "../src";
import { mapSchemaTypes } from "../src/generateMigrationSQL";

describe("migrateDb", () => {
  let connection: Connection;

  beforeEach(async () => {
    connection = await createTestConnection();
    await clearDatabase(connection);
  });

  afterEach(async () => {
    await closeTestConnection(connection);
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
    await automigrate(connection, desiredSchema);
    const schema1 = await readSchemaFromDb(connection);
    expect(schema1).toEqual(desiredSchema);
    const emptySchema = { tables: [] };
    await automigrate(connection, emptySchema);
    const schema2 = await readSchemaFromDb(connection);
    expect(schema2).toEqual(emptySchema);
  });
});
