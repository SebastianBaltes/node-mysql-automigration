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
  // Holt alle Tabellennamen der Datenbank
  const rows = (await connection.query("SHOW TABLES"))[0] as RowDataPacket[];

  // Erstellt eine Liste der Tabellennamen
  const tables = rows.map((row) => Object.values(row)[0]);

  if (tables.length === 0) return; // Falls keine Tabellen existieren, nichts tun

  // Deaktiviert den Foreign Key Check, um Tabellen zu löschen, die Fremdschlüsselbeschränkungen haben
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");

  // Löscht alle Tabellen
  for (const table of tables) {
    await connection.query(`DROP TABLE IF EXISTS ${table}`);
  }

  // Aktiviert den Foreign Key Check wieder
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}
