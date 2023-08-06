export interface Column {
  name: string;
  type: string; // Zum Beispiel 'VARCHAR(255)', 'INT', etc.
  defaultValue?: any; // Optionaler Standardwert für die Spalte
}

export interface Table {
  name: string;
  columns: Column[];
  indices?: Index[];
}

export interface Index {
  columns: string[]; // Spaltennamen, die in den Index aufgenommen werden sollen
  unique?: boolean; // Gibt an, ob der Index eindeutig sein soll oder nicht. Standard ist false.
  type?: string; // Zum Beispiel 'BTREE' oder 'HASH' usw. (abhängig von der spezifischen DB-Technologie)
  name: string; // Ein required Name für den Index. Wenn nicht angegeben, kann ein Name basierend auf den Spaltennamen generiert werden.
}

export interface Schema {
  tables: Table[];
}
