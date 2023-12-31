import { generateMigrationSQL } from "../src/generateMigrationSQL";
import { Schema } from "../src/types";

describe("generateMigrationSQL", () => {
  it("should generate SQL for adding new table", () => {
    const currentSchema: Schema = { tables: [] };
    const desiredSchema: Schema = {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "INT", defaultValue: null },
            { name: "name", type: "VARCHAR(255)", defaultValue: null },
          ],
          indices: [{ columns: ["id"], unique: true, name: "primary" }],
        },
      ],
    };

    const result = generateMigrationSQL(currentSchema, desiredSchema);

    expect(result).toEqual([
      "CREATE TABLE users (id int(11), name varchar(255));",
      "CREATE UNIQUE INDEX primary ON users(id);",
    ]);
  });
});
