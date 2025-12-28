import { DataAPIClient, type Db, type UUID } from "@datastax/astra-db-ts";
import { isAllowedGameKind, isAllowedGameKindByYear } from "@/shared/functions/typeguards";
import { MIN_COUNTRIES_PER_GAME } from "@/shared/global-constants";
import type {
  CountriesGameData,
  CountriesGameKind,
  CountriesGameKindByYear,
  CountriesGameUniverse,
} from "@/shared/global-interfaces";
import type {
  CountriesAlphabeticalTablePrimaryKey,
  CountriesAlphabeticalTableSchema,
  CountriesGdpPerCapitaTablePrimaryKey,
  CountriesGdpPerCapitaTableSchema,
  CountriesHappinessTablePrimaryKey,
  CountriesHappinessTableSchema,
  CountriesHdiTablePrimaryKey,
  CountriesHdiTableSchema,
  CountriesLandAreaTablePrimaryKey,
  CountriesLandAreaTableSchema,
  CountriesLifeExpectancyTablePrimaryKey,
  CountriesLifeExpectancyTableSchema,
  CountryMetadataTablePrimaryKey,
  CountryMetadataTableSchema,
} from "./migrations/countries/countries-migration";

export const ASTRA_KEYSPACES = {
  countries: "countries",
};

export const ASTRA_TABLES = {
  countriesByAlphabetical: "countries_by_alphabetical",
  countriesByGdpPerCapita: "countries_by_gdp_per_capita",
  countriesByHappiness: "countries_by_happiness",
  countriesByHdi: "countries_by_hdi",
  countriesByLandArea: "countries_by_land_area",
  countriesByLifeExpectancy: "countries_by_life_expectancy",
  countriesMetadata: "countries_metadata",
  countriesGamesData: "countries_games",
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

type GetGameUniverseParams = { kind: "alphabetical" | "landArea" } | { kind: CountriesGameKindByYear; year: number };

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

  public async addGuessToGame({ gameId, newGuess }: AddGuessToGameParams) {
    return this._db
      .collection<CountriesGameData>(ASTRA_TABLES.countriesGamesData, { keyspace: ASTRA_KEYSPACES.countries })
      .updateOne({ _id: gameId }, { $addToSet: { guesses: newGuess } });
  }

  public async getDecimalsForKind(kind: CountriesGameKind) {
    return this._db
      .table<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(ASTRA_TABLES.countriesMetadata, {
        keyspace: this._keyspace,
      })
      .findOne({ kind }, { projection: { decimals: true } })
      .then(d => d?.decimals);
  }

  public async getGameKinds() {
    return await this._db
      .table<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(ASTRA_TABLES.countriesMetadata, {
        keyspace: this._keyspace,
      })
      .find({}, { sort: { kind: 1 }, projection: { kind: true, applyYears: true } })
      .toArray();
  }

  public async getGameUniverse(params: GetGameUniverseParams) {
    switch (params.kind) {
      case "alphabetical":
        return this.getAlphabeticalGameUniverse();
      case "landArea":
        return this.getLandAreaGameUniverse();
      case "gdpPerCapita":
        return this.getGdpPerCapitaGameUniverse(params.year);
      case "happiness":
        return this.getHappinessGameUniverse(params.year);
      case "hdi":
        return this.getHdiGameUniverse(params.year);
      case "lifeExpectancy":
        return this.getLifeExpectancyGameUniverse(params.year);
      default:
        return [];
    }
  }

  private async getAlphabeticalGameUniverse() {
    return this._db
      .table<CountriesAlphabeticalTableSchema, CountriesAlphabeticalTablePrimaryKey>("countries_by_alphabetical", {
        keyspace: "countries",
      })
      .find({}) //, { sort: { country_code: 1 } })
      .map(i => ({ countryCode: i.country_code, possessionOf: i.possession_of }))
      .toArray();
  }

  private async getGdpPerCapitaGameUniverse(year: number) {
    return this._db
      .table<CountriesGdpPerCapitaTableSchema, CountriesGdpPerCapitaTablePrimaryKey>(
        ASTRA_TABLES.countriesByGdpPerCapita,
        {
          keyspace: ASTRA_KEYSPACES.countries,
        }
      )
      .find({ year }, { sort: { gdp_per_capita: 1 } })
      .map(i => ({
        countryCode: i.country_code,
        possessionOf: i.possession_of,
        year: i.year,
        value: i.gdp_per_capita,
      }))
      .toArray();
  }

  private async getHappinessGameUniverse(year: number) {
    return this._db
      .table<CountriesHappinessTableSchema, CountriesHappinessTablePrimaryKey>(ASTRA_TABLES.countriesByHappiness, {
        keyspace: ASTRA_KEYSPACES.countries,
      })
      .find({ year }, { sort: { happiness: 1 } })
      .map(i => ({ countryCode: i.country_code, possessionOf: i.possession_of, year: i.year, value: i.happiness }))
      .toArray();
  }

  private async getHdiGameUniverse(year: number) {
    return this._db
      .table<CountriesHdiTableSchema, CountriesHdiTablePrimaryKey>(ASTRA_TABLES.countriesByHdi, {
        keyspace: ASTRA_KEYSPACES.countries,
      })
      .find({ year }, { sort: { hdi: 1 } })
      .map(i => ({ countryCode: i.country_code, possessionOf: i.possession_of, year: i.year, value: i.hdi }))
      .toArray();
  }

  private async getLandAreaGameUniverse() {
    return this._db
      .table<CountriesLandAreaTableSchema, CountriesLandAreaTablePrimaryKey>(ASTRA_TABLES.countriesByLandArea, {
        keyspace: ASTRA_KEYSPACES.countries,
      })
      .find({}, { sort: { land_area: 1 } })
      .map(i => ({ countryCode: i.country_code, possessionOf: i.possession_of, value: i.land_area }))
      .toArray();
  }

  private async getLifeExpectancyGameUniverse(year: number) {
    return this._db
      .table<CountriesLifeExpectancyTableSchema, CountriesLifeExpectancyTablePrimaryKey>(
        ASTRA_TABLES.countriesByLifeExpectancy,
        { keyspace: ASTRA_KEYSPACES.countries }
      )
      .find({ year }, { sort: { life_expectancy: 1 } })
      .map(i => ({
        countryCode: i.country_code,
        possessionOf: i.possession_of,
        year: i.year,
        value: i.life_expectancy,
      }))
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

  public async getViableYearsForKind(kind: CountriesGameKind): Promise<number[]> {
    if (isAllowedGameKind(kind) && !isAllowedGameKindByYear(kind)) return [];

    const tableNamesByKind: Record<CountriesGameKindByYear, string> = {
      gdpPerCapita: ASTRA_TABLES.countriesByGdpPerCapita,
      happiness: ASTRA_TABLES.countriesByHappiness,
      hdi: ASTRA_TABLES.countriesByHdi,
      lifeExpectancy: ASTRA_TABLES.countriesByLifeExpectancy,
      violence: "",
    };
    const years = await this._db
      .table<{ year: number }>(tableNamesByKind[kind], { keyspace: this._keyspace })
      .find({}, { projection: { year: true } })
      .toArray();
    const amountByYear = Object.groupBy(years, i => i.year);
    const minCountriesCompliantYears = Object.entries(amountByYear)
      .map(([year, values]) => [year, values?.length ?? 0] as [string, number])
      .filter(([_, amount]) => amount >= MIN_COUNTRIES_PER_GAME)
      .map(([year]) => parseInt(year, 10));
    return minCountriesCompliantYears;
  }
}
export const db = new MlkDb("countries");
