import { generateMigrationSQL } from '../src/generateMigrationSQL';
import { Schema } from '../src/types';

describe('generateMigrationSQL', () => {
    it('should generate SQL for adding new table', () => {
        const currentSchema: Schema = { tables: [] };
        const desiredSchema: Schema = {
            tables: [
                {
                    name: 'users',
                    columns: [
                        { name: 'id', type: 'INT', defaultValue: null },
                        { name: 'name', type: 'VARCHAR(255)', defaultValue: null }
                    ],
                    indices: []
                }
            ]
        };

        const result = generateMigrationSQL(currentSchema, desiredSchema);
        expect(result).toContain('CREATE TABLE users (id INT, name VARCHAR(255));');
    });
});
