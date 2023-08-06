import { Schema, Table, Column } from './types';

export const generateMigrationSQL = (currentSchema: Schema, desiredSchema: Schema): string[] => {
    const sqlStatements: string[] = [];

    const currentTablesMap = new Map(currentSchema.tables.map(table => [table.name, table]));
    const desiredTablesMap = new Map(desiredSchema.tables.map(table => [table.name, table]));

    for (let [desiredTableName, desiredTable] of desiredTablesMap) {
        const currentTable = currentTablesMap.get(desiredTableName);

        if (!currentTable) {
            let createTableSQL = `CREATE TABLE ${desiredTableName} (`;
            let columnsSQL = desiredTable.columns.map(col => `${col.name} ${col.type}`).join(', ');
            createTableSQL += columnsSQL + ");";
            sqlStatements.push(createTableSQL);
            continue;
        }

        const currentColumnsMap = new Map(currentTable.columns.map(col => [col.name, col]));
        for (let desiredColumn of desiredTable.columns) {
            const currentColumn = currentColumnsMap.get(desiredColumn.name);
            if (!currentColumn) {
                const addColumnSQL = `ALTER TABLE ${desiredTableName} ADD ${desiredColumn.name} ${desiredColumn.type};`;
                sqlStatements.push(addColumnSQL);
            } else if (currentColumn.type !== desiredColumn.type) {
                const modifyColumnSQL = `ALTER TABLE ${desiredTableName} MODIFY ${desiredColumn.name} ${desiredColumn.type};`;
                sqlStatements.push(modifyColumnSQL);
            }
        }

        // Index handling
        const desiredIndicesMap = new Map(desiredTable.indices?.map(index => [index.name, index]));
        const currentIndexesMap = new Map(currentTable.indices?.map(index => [index.name, index]));

        if (desiredTable.indices) {
            for (let [desiredIndexName, desiredIndex] of desiredIndicesMap) {
                if (!currentIndexesMap.has(desiredIndexName)) {
                    const indexType = desiredIndex.unique ? 'UNIQUE' : '';
                    const createIndexSQL = `CREATE ${indexType} INDEX ${desiredIndexName} ON ${desiredTableName}(${desiredIndex.columns.join(', ')});`;
                    sqlStatements.push(createIndexSQL);
                }
            }
        }

        if (currentTable.indices) {
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

