import { Schema, Table, Column } from "./types";
import mysql, { RowDataPacket } from "mysql2/promise";

export const readSchemaFromDb = async (connection: mysql.Connection): Promise<Schema> => {
  const tables: Table[] = [];

  const tableRows = (await connection.query("SHOW TABLES"))[0] as RowDataPacket[];

  for (let row of tableRows) {
    const tableName = Object.values(row)[0];

    const columnRows = (await connection.query(`DESCRIBE ${tableName}`))[0] as RowDataPacket;
    const columns: Column[] = columnRows.map((col: any) => ({
      name: col.Field,
      type: col.Type,
      defaultValue: col.Default,
    }));

    const indexRows = (
      await connection.query(`SHOW INDEXES FROM ${tableName}`)
    )[0] as RowDataPacket;
    const indices = indexRows.reduce((acc: any[], index: any) => {
      const existingIndex = acc.find((idx) => idx.name === index.Key_name);
      if (existingIndex) {
        existingIndex.columns.push(index.Column_name);
      } else {
        acc.push({
          name: index.Key_name,
          columns: [index.Column_name],
          unique: !index.Non_unique,
        });
      }
      return acc;
    }, []);

    tables.push({
      name: tableName,
      columns,
      indices,
    });
  }

  return { tables };
};
