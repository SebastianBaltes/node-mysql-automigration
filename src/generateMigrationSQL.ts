import { Schema, Table, Column, Index } from "./types";
import { isEqual } from "lodash";

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

  function addIndex(index: Index, tableName: string) {
    const indexType = index.unique ? "UNIQUE " : "";
    const createIndexSQL = `CREATE ${indexType}INDEX ${
      index.name
    } ON ${tableName}(${index.columns.join(", ")});`;
    sqlStatements.push(createIndexSQL);
  }

  function dropIndex(indexName: string, tableName: string) {
    const dropIndexSQL = `DROP INDEX ${indexName} ON ${tableName};`;
    sqlStatements.push(dropIndexSQL);
  }

  function defaultSQL(col: Column) {
    return col.defaultValue == null ? "" : ` DEFAULT ${col.defaultValue}`;
  }

  for (let [desiredTableName, desiredTable] of desiredTablesMap) {
    const currentTable = currentTablesMap.get(desiredTableName);

    const colDefinition = (col: Column) =>
      col.name +
      " " +
      mapTypeAlias(col.type) +
      (col.defaultValue ? ` DEFAULT ${col.defaultValue}` : "");

    if (currentTable) {
      const currentColumnsMap = new Map(currentTable.columns.map((col) => [col.name, col]));
      for (let desiredColumn of desiredTable.columns) {
        const currentColumn = currentColumnsMap.get(desiredColumn.name);
        if (!currentColumn) {
          sqlStatements.push(
            `ALTER TABLE ${desiredTableName} ADD ${colDefinition(desiredColumn)};`
          );
        } else if (
          mapTypeAlias(currentColumn.type) !== mapTypeAlias(desiredColumn.type) ||
          currentColumn.defaultValue !== desiredColumn.defaultValue
        ) {
          sqlStatements.push(
            `ALTER TABLE ${desiredTableName} MODIFY ${colDefinition(desiredColumn)};`
          );
        }
      }
    } else {
      sqlStatements.push(
        `CREATE TABLE ${desiredTableName} (${desiredTable.columns.map(colDefinition).join(", ")});`
      );
    }

    // Index handling
    const desiredIndicesMap = new Map(desiredTable.indices?.map((index) => [index.name, index]));
    const currentIndexesMap = new Map(currentTable?.indices?.map((index) => [index.name, index]));

    if (desiredTable.indices) {
      for (let [desiredIndexName, desiredIndex] of desiredIndicesMap) {
        if (currentIndexesMap.has(desiredIndexName)) {
          const currentIndex = currentIndexesMap.get(desiredIndexName);
          if (!isEqual(currentIndex, desiredIndex)) {
            dropIndex(desiredIndexName, desiredTableName);
            addIndex(desiredIndex, desiredTableName);
          }
        } else {
          addIndex(desiredIndex, desiredTableName);
        }
      }
    }

    if (currentTable?.indices) {
      for (let [currentIndexName] of currentIndexesMap) {
        if (!desiredIndicesMap.has(currentIndexName)) {
          dropIndex(currentIndexName, desiredTableName);
        }
      }
    }
  }

  return sqlStatements;
};
