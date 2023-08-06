import mysql, {Connection} from 'mysql2/promise';

export const createTestConnection = ()=>mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'testpassword',
        database: 'testdb'
    });

export const closeTestConnection = (connection: Connection)=> connection.end();
