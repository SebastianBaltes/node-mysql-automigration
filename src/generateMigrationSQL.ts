import { Schema, Table, Column, Index } from "./types";

export const fullIndexName = (table: Table, index: Index) => index.name;

export function mapTypeAlias(alias: string): string {
  const lowercase = alias.toLowerCase();
  switch (lowercase) {
    case "int":
      return "int(11)";
    case "tinyint":
      return "tinyint(4)";
    case "smallint":
      return "smallint(6)";
    case "mediumint":
      return "mediumint(9)";
    case "bigint":
      return "bigint(20)";
    case "decimal":
      return "decimal(10,0)";
    case "varchar":
      return "varchar(255)";
    case "year":
      return "year(4)";
    case "char":
      return "char(255)";
    case "varbinary":
      return "varbinary(255)";
    default:
      return lowercase;
  }
}

export function mapSchemaTypes(schema: Schema): Schema {
  return {
    ...schema,
    tables: schema.tables.map((table) => ({
      ...table,
      columns: table.columns.map((column) => ({ ...column, type: mapTypeAlias(column.type) })),
    })),
  };
}

export const generateMigrationSQL = (currentSchema: Schema, desiredSchema: Schema): string[] => {
  const sqlStatements: string[] = [];

  const currentTablesMap = new Map(currentSchema.tables.map((table) => [table.name, table]));
  const desiredTablesMap = new Map(desiredSchema.tables.map((table) => [table.name, table]));

  for (let [desiredTableName, desiredTable] of desiredTablesMap) {
    const currentTable = currentTablesMap.get(desiredTableName);

    if (currentTable) {
      const currentColumnsMap = new Map(currentTable.columns.map((col) => [col.name, col]));
      for (let desiredColumn of desiredTable.columns) {
        const currentColumn = currentColumnsMap.get(desiredColumn.name);
        if (!currentColumn) {
          const addColumnSQL = `ALTER TABLE ${desiredTableName} ADD ${desiredColumn.name} ${desiredColumn.type};`;
          sqlStatements.push(addColumnSQL);
        } else if (mapTypeAlias(currentColumn.type) !== mapTypeAlias(desiredColumn.type)) {
          const modifyColumnSQL = `ALTER TABLE ${desiredTableName} MODIFY ${
            desiredColumn.name
          } ${mapTypeAlias(desiredColumn.type)};`;
          sqlStatements.push(modifyColumnSQL);
        }
      }
    } else {
      let createTableSQL = `CREATE TABLE ${desiredTableName} (`;
      let columnsSQL = desiredTable.columns
        .map((col) => `${col.name} ${mapTypeAlias(col.type)}`)
        .join(", ");
      createTableSQL += columnsSQL + ");";
      sqlStatements.push(createTableSQL);
    }

    // Index handling
    const desiredIndicesMap = new Map(
      desiredTable.indices?.map((index) => [fullIndexName(desiredTable, index), index])
    );
    const currentIndexesMap = new Map(
      currentTable?.indices?.map((index) => [fullIndexName(currentTable, index), index])
    );

    if (desiredTable.indices) {
      for (let [desiredIndexName, desiredIndex] of desiredIndicesMap) {
        if (!currentIndexesMap.has(desiredIndexName)) {
          const indexType = desiredIndex.unique ? "UNIQUE" : "";
          const createIndexSQL = `CREATE ${indexType} INDEX ${desiredIndexName} ON ${desiredTableName}(${desiredIndex.columns.join(
            ", "
          )});`;
          sqlStatements.push(createIndexSQL);
        }
      }
    }

    if (currentTable?.indices) {
      for (let [currentIndexName] of currentIndexesMap) {
        if (!desiredIndicesMap.has(currentIndexName)) {
          const dropIndexSQL = `DROP INDEX ${currentIndexName} ON ${desiredTableName};`;
          sqlStatements.push(dropIndexSQL);
        }
      }
    }
  }

  return sqlStatements;
};
