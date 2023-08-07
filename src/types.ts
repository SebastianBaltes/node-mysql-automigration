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
