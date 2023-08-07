import mysql from "mysql2/promise";

export async function executeMigrations(
  connection: mysql.Connection,
  sqlStatements: string[]
): Promise<void> {
  await connection.beginTransaction();

  for (let i = 0; i < sqlStatements.length; i++) {
    try {
      await connection.query(sqlStatements[i]);
    } catch (error) {
      await connection.rollback();
      throw new Error(
        `Failed to execute statement #${i + 1} (${sqlStatements[i]}). Error: ${
          (error as any).message
        }`
      );
    }
  }

  await connection.commit();
}
