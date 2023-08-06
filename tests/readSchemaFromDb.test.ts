import { readSchemaFromDb } from "../src/readSchemaFromDb";
import { createTestConnection, closeTestConnection } from "./testHelpers";
import { Connection } from "mysql2/promise";
import { Schema } from "../src/types";
import { automigrate } from "../src";

describe("readSchemaFromDb", () => {
  let connection: Connection;

  beforeEach(async () => {
    connection = await createTestConnection();
  });

  afterEach(async () => {
    await closeTestConnection(connection);
  });

  it("reads from an empty database", async () => {
    const schema = await readSchemaFromDb(connection);
    expect(schema.tables).toHaveLength(0);
  });
});
