# node-mysql-automigrate

`node-mysql-automigrate` is a lightweight library that enables automatic schema migration for MySQL databases based on a
JSON schema specification. The scope of this library is confined to a small subset of the complete MySQL SQL schema, 
as illustrated in the following schema definition:


```typescript
export interface Column {
  name: string;
  type: string; // For example 'VARCHAR(255)', 'INT', etc.
  defaultValue?: any; // Optional default value for the column
}

export interface Table {
  name: string;
  columns: Column[];
  indices?: Index[];
}

export interface Index {
  columns: string[]; // Column names to be included in the index
  unique?: boolean; // Indicates whether the index should be unique or not. Default is false.
  type?: string; // For example 'BTREE' or 'HASH' etc. (depending on the specific DB technology)
  name: string; // A required name for the index
}

export interface Schema {
  tables: Table[];
}
```

## Features

- 🚀 **Automated Migrations**: Compares the existing database schema with the desired schema and generates SQL commands
  for migration.
- 🔄 **Safe Updates**: New columns and data types can be added, existing ones can be modified, but columns will not be
  deleted.
- 🧪 **Testing**: Integrated with Docker for testing against a real MySQL instance.

## Installation

```bash
npm install node-mysql-automigrate
```

## Usage

1. Define your desired schema in a `schema.json` file:

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "type": "INT",
          "default": "NOT NULL AUTO_INCREMENT"
        }
        // ... more columns
      ],
      "indices": [
        {
          "name": "PRIMARY",
          "columns": [
            "id"
          ]
        }
      ]
    }
    // ... more tables
  ]
}
```

2. Use the library in your application:

```typescript
import {automigrate} from 'node-mysql-automigrate';

const schemaJson = require('./path_to_your_schema.json');
const connection = /* your mysql connection setup */;

await automigrate(connection, schemaJson);
```

Automigrate compares against the actual database schema, which isn't a performance-optimized operation. 
In a real-world application, you'd want to limit these checks — for instance, only post-deployments. 
It might also be beneficial to store a hash of the schema.json in the database and compare it 
with the hash of the new schema.json before invoking automigrate.

## Testing

Ensure you have Docker installed on your machine.

To run integration tests:

```bash
npm test
```

This will spin up a MySQL instance on Docker, run tests against it, and then tear it down.

## Contributing

We welcome contributions! Please open an issue or submit a pull request if you'd like to improve the library.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
