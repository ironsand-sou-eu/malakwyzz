import { type InferTablePrimaryKey, type InferTableSchema, Table } from "@datastax/astra-db-ts";
import type { CountriesGameData } from "@/shared/global-interfaces";
import { ASTRA_KEYSPACES, ASTRA_TABLES, MlkDb } from "../../db";
import countriesAlphabeticalJsonData from "./countries_by_alphabetical.json";
import countriesGdpPerCapitaJsonData from "./countries_by_gdp_per_capita.json";
import countriesHappinessJsonData from "./countries_by_happiness.json";
import countriesHdiJsonData from "./countries_by_hdi.json";
import countriesLandAreaJsonData from "./countries_by_land_area.json";
import countriesLifeExpectancyJsonData from "./countries_by_life_expectancy.json";
import countriesJsonMetadata from "./countriesMetadata.json";

class MigrationMlkDb extends MlkDb {
  get db() {
    return this._db;
  }
}

const migrationDb = new MigrationMlkDb("countries");

const CountriesAlphabeticalTableDefinition = Table.schema({
  columns: {
    country_code: "text",
    possession_of: "text",
  },

  primaryKey: {
    partitionBy: ["country_code"],
  },
});

const CountriesLandAreaTableDefinition = Table.schema({
  columns: {
    land_area: "text",
    country_code: "text",
    possession_of: "text",
  },

  primaryKey: {
    partitionBy: ["country_code"],
    partitionSort: { land_area: 1 },
  },
});

const CountriesGdpPerCapitaTableDefinition = Table.schema({
  columns: {
    year: "int",
    country_code: "text",
    gdp_per_capita: "text",
    possession_of: "text",
  },

  primaryKey: {
    partitionBy: ["year"],
    partitionSort: { gdp_per_capita: 1 },
  },
});

const CountriesHappinessTableDefinition = Table.schema({
  columns: {
    year: "int",
    country_code: "text",
    happiness: "text",
    possession_of: "text",
  },

  primaryKey: {
    partitionBy: ["year"],
    partitionSort: { happiness: 1 },
  },
});

const CountriesHdiTableDefinition = Table.schema({
  columns: {
    year: "int",
    country_code: "text",
    hdi: "text",
    possession_of: "text",
  },

  primaryKey: {
    partitionBy: ["year"],
    partitionSort: { hdi: 1 },
  },
});

const CountriesLifeExpectancyTableDefinition = Table.schema({
  columns: {
    year: "int",
    country_code: "text",
    life_expectancy: "text",
    possession_of: "text",
  },

  primaryKey: {
    partitionBy: ["year"],
    partitionSort: { life_expectancy: 1 },
  },
});

const CountriesMetadataTableDefinition = Table.schema({
  columns: {
    kind: "text",
    applyYears: "boolean",
    decimals: "tinyint",
    source: "text",
  },

  primaryKey: {
    partitionBy: ["kind"],
  },
});

// Infer the TypeScript-equivalent type of the table's schema and primary key.
// Export the types for later use.
export type CountriesAlphabeticalTableSchema = InferTableSchema<typeof CountriesAlphabeticalTableDefinition>;
export type CountriesAlphabeticalTablePrimaryKey = InferTablePrimaryKey<typeof CountriesAlphabeticalTableDefinition>;

export type CountriesLandAreaTableSchema = InferTableSchema<typeof CountriesLandAreaTableDefinition>;
export type CountriesLandAreaTablePrimaryKey = InferTablePrimaryKey<typeof CountriesLandAreaTableDefinition>;

export type CountriesGdpPerCapitaTableSchema = InferTableSchema<typeof CountriesGdpPerCapitaTableDefinition>;
export type CountriesGdpPerCapitaTablePrimaryKey = InferTablePrimaryKey<typeof CountriesGdpPerCapitaTableDefinition>;

export type CountriesHappinessTableSchema = InferTableSchema<typeof CountriesHappinessTableDefinition>;
export type CountriesHappinessTablePrimaryKey = InferTablePrimaryKey<typeof CountriesHappinessTableDefinition>;

export type CountriesHdiTableSchema = InferTableSchema<typeof CountriesHdiTableDefinition>;
export type CountriesHdiTablePrimaryKey = InferTablePrimaryKey<typeof CountriesHdiTableDefinition>;

export type CountriesLifeExpectancyTableSchema = InferTableSchema<typeof CountriesLifeExpectancyTableDefinition>;
export type CountriesLifeExpectancyTablePrimaryKey = InferTablePrimaryKey<
  typeof CountriesLifeExpectancyTableDefinition
>;

export type CountryMetadataTableSchema = InferTableSchema<typeof CountriesMetadataTableDefinition>;
export type CountryMetadataTablePrimaryKey = InferTablePrimaryKey<typeof CountriesMetadataTableDefinition>;

export async function createCountriesAlphabeticalTable() {
  const table = await migrationDb.db.createTable<
    CountriesAlphabeticalTableSchema,
    CountriesAlphabeticalTablePrimaryKey
  >(ASTRA_TABLES.countriesByAlphabetical, {
    definition: CountriesAlphabeticalTableDefinition,
    ifNotExists: true,
    keyspace: ASTRA_KEYSPACES.countries,
  });

  console.log(`Created table ${ASTRA_TABLES.countriesByAlphabetical}`);
}

export async function createCountriesGdpPerCapitaTable() {
  const table = await migrationDb.db.createTable<
    CountriesGdpPerCapitaTableSchema,
    CountriesGdpPerCapitaTablePrimaryKey
  >(ASTRA_TABLES.countriesByGdpPerCapita, {
    definition: CountriesGdpPerCapitaTableDefinition,
    ifNotExists: true,
    keyspace: ASTRA_KEYSPACES.countries,
  });

  console.log(`Created table ${ASTRA_TABLES.countriesByGdpPerCapita}`);

  await table.createIndex("gdp_per_capita_index", "gdp_per_capita");

  console.log("Indexed columns");
}

export async function createCountriesHappinessTable() {
  const table = await migrationDb.db.createTable<CountriesHappinessTableSchema, CountriesHappinessTablePrimaryKey>(
    ASTRA_TABLES.countriesByHappiness,
    {
      definition: CountriesHappinessTableDefinition,
      ifNotExists: true,
      keyspace: ASTRA_KEYSPACES.countries,
    }
  );

  console.log(`Created table ${ASTRA_TABLES.countriesByHappiness}`);

  await table.createIndex("happiness_index", "happiness");

  console.log("Indexed columns");
}

export async function createCountriesHdiTable() {
  const table = await migrationDb.db.createTable<CountriesHdiTableSchema, CountriesHdiTablePrimaryKey>(
    ASTRA_TABLES.countriesByHdi,
    {
      definition: CountriesHdiTableDefinition,
      ifNotExists: true,
      keyspace: ASTRA_KEYSPACES.countries,
    }
  );

  console.log(`Created table ${ASTRA_TABLES.countriesByHdi}`);

  await table.createIndex("hdi_index", "hdi");

  console.log("Indexed columns");
}

export async function createCountriesLandAreaTable() {
  const table = await migrationDb.db.createTable<CountriesLandAreaTableSchema, CountriesLandAreaTablePrimaryKey>(
    ASTRA_TABLES.countriesByLandArea,
    {
      definition: CountriesLandAreaTableDefinition,
      ifNotExists: true,
      keyspace: ASTRA_KEYSPACES.countries,
    }
  );

  console.log(`Created table ${ASTRA_TABLES.countriesByLandArea}`);

  await table.createIndex("land_area_index", "land_area");

  console.log("Indexed columns");
}

export async function createCountriesLifeExpectancyTable() {
  const table = await migrationDb.db.createTable<
    CountriesLifeExpectancyTableSchema,
    CountriesLifeExpectancyTablePrimaryKey
  >(ASTRA_TABLES.countriesByLifeExpectancy, {
    definition: CountriesLifeExpectancyTableDefinition,
    ifNotExists: true,
    keyspace: ASTRA_KEYSPACES.countries,
  });

  console.log(`Created table ${ASTRA_TABLES.countriesByLifeExpectancy}`);

  await table.createIndex("life_expectancy_index", "life_expectancy");

  console.log("Indexed columns");
}

export async function createCountriesMetadataTable() {
  await migrationDb.db.createTable<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(
    ASTRA_TABLES.countriesMetadata,
    {
      definition: CountriesMetadataTableDefinition,
      ifNotExists: true,
      keyspace: ASTRA_KEYSPACES.countries,
    }
  );

  console.log(`Created table ${ASTRA_TABLES.countriesMetadata}`);
}

export async function createCountriesGamesCollection() {
  await migrationDb.db.createCollection<CountriesGameData>(ASTRA_TABLES.countriesGamesData, {
    keyspace: ASTRA_KEYSPACES.countries,
    defaultId: { type: "uuid" },
  });
  console.log(`Created collection ${ASTRA_TABLES.countriesGamesData}`);
}

export async function seedCountriesAlphabeticalData() {
  const table = migrationDb.db.table<CountriesAlphabeticalTableSchema, CountriesAlphabeticalTablePrimaryKey>(
    ASTRA_TABLES.countriesByAlphabetical,
    { keyspace: ASTRA_KEYSPACES.countries }
  );

  const insertedResult = await table.insertMany(countriesAlphabeticalJsonData);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}

export async function seedCountriesGdpPerCapitaData() {
  const table = migrationDb.db.table<CountriesGdpPerCapitaTableSchema, CountriesGdpPerCapitaTablePrimaryKey>(
    ASTRA_TABLES.countriesByGdpPerCapita,
    { keyspace: ASTRA_KEYSPACES.countries }
  );

  const insertedResult = await table.insertMany(countriesGdpPerCapitaJsonData);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}

export async function seedCountriesHappinessData() {
  const table = migrationDb.db.table<CountriesHappinessTableSchema, CountriesHappinessTablePrimaryKey>(
    ASTRA_TABLES.countriesByHappiness,
    { keyspace: ASTRA_KEYSPACES.countries }
  );

  const insertedResult = await table.insertMany(countriesHappinessJsonData);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}

export async function seedCountriesHdiData() {
  const table = migrationDb.db.table<CountriesHdiTableSchema, CountriesHdiTablePrimaryKey>(
    ASTRA_TABLES.countriesByHdi,
    { keyspace: ASTRA_KEYSPACES.countries }
  );

  const insertedResult = await table.insertMany(countriesHdiJsonData);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}

export async function seedCountriesLandAreaData() {
  const table = migrationDb.db.table<CountriesLandAreaTableSchema, CountriesLandAreaTablePrimaryKey>(
    ASTRA_TABLES.countriesByLandArea,
    { keyspace: ASTRA_KEYSPACES.countries }
  );

  const insertedResult = await table.insertMany(countriesLandAreaJsonData);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}

export async function seedCountriesLifeExpectancyData() {
  const table = migrationDb.db.table<CountriesLifeExpectancyTableSchema, CountriesLifeExpectancyTablePrimaryKey>(
    ASTRA_TABLES.countriesByLifeExpectancy,
    { keyspace: ASTRA_KEYSPACES.countries }
  );

  const insertedResult = await table.insertMany(countriesLifeExpectancyJsonData);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}

export async function seedCountriesMetadata() {
  const table = migrationDb.db.table<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(
    ASTRA_TABLES.countriesMetadata,
    { keyspace: ASTRA_KEYSPACES.countries }
  );

  const insertedResult = await table.insertMany(countriesJsonMetadata);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}
