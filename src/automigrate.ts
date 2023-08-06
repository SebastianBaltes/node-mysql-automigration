import mysql from 'mysql2/promise';
import { Schema } from './types';
import {readSchemaFromDb} from './readSchemaFromDb';
import {generateMigrationSQL} from './generateMigrationSQL';
import {executeMigrations} from './executeMigrations';

export async function automigrate(connection: mysql.Connection, desiredSchema: Schema): Promise<void> {
    // Aktuelles Schema aus der Datenbank lesen
    const currentSchema = await readSchemaFromDb(connection);

    // SQL-Anweisungen für die Migration generieren
    const sqlStatements = generateMigrationSQL(currentSchema, desiredSchema);

    // Migration ausführen, wenn es Anweisungen gibt
    if (sqlStatements.length > 0) {
        await executeMigrations(connection, sqlStatements);
    } else {
        console.log('Database is already up-to-date. No migrations required.');
    }
}

