import mysql from 'mysql2/promise';

export async function executeMigrations(connection: mysql.Connection, sqlStatements: string[]): Promise<void> {
    // Beginnen einer Transaktion, um sicherzustellen, dass alle Anweisungen erfolgreich abgeschlossen werden
    // oder dass im Fehlerfall alles zurückgesetzt wird
    await connection.beginTransaction();

    for (let i = 0; i < sqlStatements.length; i++) {
        try {
            await connection.query(sqlStatements[i]);
        } catch (error) {
            // Bei einem Fehler die Transaktion zurücksetzen und einen Fehler zurückgeben
            await connection.rollback();
            throw new Error(`Failed to execute statement #${i + 1} (${sqlStatements[i]}). Error: ${(error as any).message}`);
        }
    }

    // Wenn alle Anweisungen erfolgreich waren, die Transaktion bestätigen
    await connection.commit();
}

