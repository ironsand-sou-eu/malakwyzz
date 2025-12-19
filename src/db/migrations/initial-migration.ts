import { type InferTablePrimaryKey, type InferTableSchema, Table } from "@datastax/astra-db-ts";
// @ts-expect-error-next-line
import { ASTRA_KEYSPACES, ASTRA_TABLES, connectToDatabase } from "../db.ts";
import countriesJsonData from "./countriesData.json";
import countriesJsonMetadata from "./countriesMetadata.json";

const db = connectToDatabase();

interface CountryGameData{
  game_id: "uuid",
  guesses: {
    guess:"string",
    directionToTarget:"up | down",
    distanceToTarget: "number",
    timestamp: "timestamp" 
  }[],
  target: "string"
}

const CountryDataTableDefinition = Table.schema({
  columns: {
    year: "smallint",
    country: "text",
    land_area: "text",
    life_expectancy: "text",
    happyness: "text",
    hdi: "text",
    gdp_per_capita: "text",
    violence: "text",
  },

  primaryKey: {
    partitionBy: ["year"],
    partitionSort: { country: 1 },
  },
});

const CountryMetadataTableDefinition = Table.schema({
  columns: {
    kind: "text",
    decimals: "tinyint",
    source: "text",
  },

  primaryKey: {
    partitionBy: ["kind"],
  },
});




// Infer the TypeScript-equivalent type of the table's schema and primary key.
// Export the types for later use.
export type CountryDataTableSchema = InferTableSchema<typeof CountryDataTableDefinition>;
export type CountryDataTablePrimaryKey = InferTablePrimaryKey<typeof CountryDataTableDefinition>;

export type CountryMetadataTableSchema = InferTableSchema<typeof CountryMetadataTableDefinition>;
export type CountryMetadataTablePrimaryKey = InferTablePrimaryKey<typeof CountryMetadataTableDefinition>;

export async function createCountriesTable() {
  const table = await db.createTable<CountryDataTableSchema, CountryDataTablePrimaryKey>(ASTRA_TABLES.countriesData, {
    definition: CountryDataTableDefinition,
    ifNotExists: true,
    keyspace: ASTRA_KEYSPACES.countries,
  });

  console.log(`Created table ${ASTRA_TABLES.countriesData}`);

  await table.createIndex("land_area_index", "land_area");
  await table.createIndex("life_expectancy_index", "life_expectancy");
  await table.createIndex("happyness_index", "happyness");
  await table.createIndex("hdi_index", "hdi");
  await table.createIndex("gdp_per_capita_index", "gdp_per_capita");
  await table.createIndex("violence_index", "violence");

  console.log("Indexed columns");
}

export async function createCountriesCollection(){

 await db.createCollection<CountryGameData>(ASTRA_TABLES.countriesGamesData,{
  keyspace: ASTRA_KEYSPACES.countries,
  defaultId: {
    type:'uuid'},
})
 console.log(`Created collection ${ASTRA_TABLES.countriesGamesData}`);
}

export async function createCountriesMetadataTable() {
  await db.createTable<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(ASTRA_TABLES.countriesMetadata, {
    definition: CountryMetadataTableDefinition,
    ifNotExists: true,
    keyspace: ASTRA_KEYSPACES.countries,
  });

  console.log(`Created table ${ASTRA_TABLES.countriesMetadata}`);
}

export async function seedCountriesData() {
  const table = db.table<CountryDataTableSchema, CountryDataTablePrimaryKey>(ASTRA_TABLES.countriesData, {
    keyspace: ASTRA_KEYSPACES.countries,
  });

  const insertedResult = await table.insertMany(countriesJsonData);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}

export async function seedCountriesMetadata() {
  const table = db.table<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(ASTRA_TABLES.countriesMetadata, {
    keyspace: ASTRA_KEYSPACES.countries,
  });

  const insertedResult = await table.insertMany(countriesJsonMetadata);
  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
}
