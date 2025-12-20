import { DataAPIClient, type Db } from "@datastax/astra-db-ts";

export const ASTRA_KEYSPACES = {
  countries: "countries",
};

export const ASTRA_TABLES = {
  countriesData: "countries_data",
  countriesMetadata: "countries_metadata",
  countriesGamesData: "country_games"
};

/**
 * Connects to a DataStax Astra database.
 * This function retrieves the database endpoint and application token from the
 * environment variables `ASTRA_API_ENDPOINT` and `ASTRA_APPLICATION_TOKEN`.
 *
 * @returns An instance of the connected database.
 * @throws Will throw an error if the environment variables
 * `API_ENDPOINT` or `APPLICATION_TOKEN` are not defined.
 */
export function connectToDatabase(): Db {
  const { ASTRA_API_ENDPOINT: endpoint, ASTRA_APPLICATION_TOKEN: token } = process.env;

  if (!token || !endpoint) {
    throw new Error("Environment variables API_ENDPOINT and APPLICATION_TOKEN must be defined.");
  }

  const client = new DataAPIClient();
  const database = client.db(endpoint, { token });

  console.log(`Connected to database ${database.id}`);

  return database;
}
