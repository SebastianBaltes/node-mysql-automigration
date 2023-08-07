import mysql, { Connection, RowDataPacket } from "mysql2/promise";

export const createTestConnection = () =>
  mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "testpassword",
    port: 3307,
    database: "testdb",
  });

export const closeTestConnection = (connection: Connection) => connection.end();

export async function clearDatabase(connection: Connection): Promise<void> {
  const rows = (await connection.query("SHOW TABLES"))[0] as RowDataPacket[];
  const tables = rows.map((row) => Object.values(row)[0]);
  if (tables.length === 0) return;
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of tables) {
    await connection.query(`DROP TABLE IF EXISTS ${table}`);
  }
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}
