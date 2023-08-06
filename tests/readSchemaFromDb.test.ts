import { readSchemaFromDb } from '../src/readSchemaFromDb';
import { createTestConnection, closeTestConnection } from './testHelpers';
import {Connection} from "mysql2/promise";

describe('readSchemaFromDb', () => {
    let connection: Connection;

    beforeEach(async () => {
        connection = await createTestConnection();
    });

    afterEach(async () => {
        await closeTestConnection(connection);
    });

    it('reads from an empty database', async () => {
        const schema = await readSchemaFromDb(connection);
        expect(schema.tables).toHaveLength(0);
    });

});
