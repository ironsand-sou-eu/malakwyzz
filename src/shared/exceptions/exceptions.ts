type ErrorTranslator = Awaited<ReturnType<typeof import("next-intl/server")["getTranslations"]>>;

type ErrorConstructorParams = {
  errorScopedTranslator: ErrorTranslator;
};

export class BadRequestException extends Error {
  constructor({ errorScopedTranslator: t }: ErrorConstructorParams) {
    super(t("bad-request"));
    this.name = BadRequestException.name;
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

export class UnsuportedTypeException extends Error {
  public name: string;
  constructor({ errorScopedTranslator: t }: ErrorConstructorParams) {
    super(t("game-not-found"));
    this.name = UnsuportedTypeException.name;
    Object.setPrototypeOf(this, UnsuportedTypeException.prototype);
  }
}

export class InsufficientGameDataAmountException extends Error {
  public name: string;
  constructor({ errorScopedTranslator: t }: ErrorConstructorParams) {
    super(t("insufficient-game-data-amount"));
    this.name = InsufficientGameDataAmountException.name;
    Object.setPrototypeOf(this, InsufficientGameDataAmountException.prototype);
  }
}

export class UnavailableGameKindException extends Error {
  public name: string;
  constructor({ errorScopedTranslator: t }: ErrorConstructorParams) {
    super(t("unavailable-game-kind"));
    this.name = UnavailableGameKindException.name;
    Object.setPrototypeOf(this, UnavailableGameKindException.prototype);
  }
}

export class ValueNotFoundInGameException extends Error {
  public name: string;
  constructor({ errorScopedTranslator: t }: ErrorConstructorParams) {
    super(t("unsuported-type"));
    this.name = ValueNotFoundInGameException.name;
    Object.setPrototypeOf(this, ValueNotFoundInGameException.prototype);
  }
}

export class GameNotFoundException extends Error {
  public name: string;
  constructor({ errorScopedTranslator: t }: ErrorConstructorParams) {
    super(t("value-not-found-in-game"));
    this.name = GameNotFoundException.name;
    Object.setPrototypeOf(this, GameNotFoundException.prototype);
  }
}
