import { DataAPIClient, type Db, type UUID } from "@datastax/astra-db-ts";
import type { CountriesGameData, CountriesGameKind, CountriesGameUniverse } from "@/app/(shared)/global-interfaces";
import type {
  CountryDataTablePrimaryKey,
  CountryDataTableSchema,
  CountryMetadataTablePrimaryKey,
  CountryMetadataTableSchema,
} from "./migrations/countries/countries-migration";

export const ASTRA_KEYSPACES = {
  countries: "countries",
};

export const ASTRA_TABLES = {
  countriesData: "countries_data",
  countriesMetadata: "countries_metadata",
  countriesGamesData: "country_games",
};

interface CreateCountriesGameParams {
  userId: UUID;
  kind: CountriesGameKind;
  gameUniverse: CountriesGameUniverse;
  year: number;
  target: CountriesGameData["target"];
}

interface GetCountriesGameGuessesParams {
  gameId: UUID;
}

interface AddGuessToGameParams {
  gameId: UUID;
  newGuess: CountriesGameData["guesses"][number];
}

export class MlkDb {
  protected _db: Db;
  protected _keyspace: keyof typeof ASTRA_KEYSPACES;

  constructor(keyspace: keyof typeof ASTRA_KEYSPACES) {
    this._db = this.connectToDatabase();
    this._keyspace = keyspace;
  }

  private connectToDatabase(): Db {
    const { ASTRA_API_ENDPOINT: endpoint, ASTRA_APPLICATION_TOKEN: token } = process.env;

    if (!token || !endpoint) {
      throw new Error("Environment variables API_ENDPOINT and APPLICATION_TOKEN must be defined.");
    }

    const client = new DataAPIClient();
    const database = client.db(endpoint, { token });

    console.log(`Connected to database ${database.id}`);

    return database;
  }

  public async getGameKinds() {
    return await this._db
      .table<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(ASTRA_TABLES.countriesMetadata, {
        keyspace: this._keyspace,
      })
      .find({}, { sort: { kind: 1 }, projection: { kind: true } })
      .toArray();
  }

  public async getDecimalsForKind(kind: CountriesGameKind) {
    return this._db
      .table<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(ASTRA_TABLES.countriesMetadata, {
        keyspace: this._keyspace,
      })
      .findOne({ kind }, { projection: { decimals: true } })
      .then(d => d?.decimals);
  }

  public async getGameUniverse(kind: CountriesGameKind, year: number) {
    const sortingColumn = kind === "alphabetical" ? "country" : kind;
    return this._db
      .table<CountryDataTableSchema, CountryDataTablePrimaryKey>(ASTRA_TABLES.countriesData, {
        keyspace: ASTRA_KEYSPACES.countries,
      })
      .find(
        { year: kind === "alphabetical" ? 2023 : year },
        { sort: { [sortingColumn]: 1 }, projection: { country: true, [sortingColumn]: true } }
      )
      .toArray();
  }

  public async createGame({ kind, gameUniverse, target, userId, year }: CreateCountriesGameParams) {
    return this._db
      .collection<CountriesGameData>(ASTRA_TABLES.countriesGamesData, { keyspace: ASTRA_KEYSPACES.countries })
      .insertOne({ context: { gameUniverse, kind, year }, guesses: [], player_id: userId, target });
  }

  public async getGameInfo({ gameId }: GetCountriesGameGuessesParams) {
    return this._db
      .collection<CountriesGameData>(ASTRA_TABLES.countriesGamesData, { keyspace: ASTRA_KEYSPACES.countries })
      .findOne({ _id: gameId });
  }

  public async addGuessToGame({ gameId, newGuess }: AddGuessToGameParams) {
    return this._db
      .collection<CountriesGameData>(ASTRA_TABLES.countriesGamesData, { keyspace: ASTRA_KEYSPACES.countries })
      .updateOne({ _id: gameId }, { $addToSet: { guesses: newGuess } });
  }
}
export const db = new MlkDb("countries");
