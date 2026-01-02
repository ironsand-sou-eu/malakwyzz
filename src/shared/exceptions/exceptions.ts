export class BadRequestException extends Error {
  constructor(msg: string) {
    super(msg ?? "Bad request");
    this.name = BadRequestException.name;
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

export class UnsuportedTypeException extends BadRequestException {
  public name: string;
  constructor() {
    super('Request should have a content-type header of "application/json"');
    this.name = UnsuportedTypeException.name;
    Object.setPrototypeOf(this, UnsuportedTypeException.prototype);
  }
}

export class InsufficientGameDataAmountException extends Error {
  public name: string;
  constructor() {
    super("The provided parameters point to a game with insufficient entities");
    this.name = InsufficientGameDataAmountException.name;
    Object.setPrototypeOf(this, InsufficientGameDataAmountException.prototype);
  }
}

export class UnavailableGameKindException extends Error {
  public name: string;
  constructor() {
    super("Game kind not allowed");
    this.name = UnavailableGameKindException.name;
    Object.setPrototypeOf(this, UnavailableGameKindException.prototype);
  }
}

export class ValueNotFoundInGameException extends Error {
  public name: string;
  constructor() {
    super("Provided guess is not in the game set, try again.");
    this.name = ValueNotFoundInGameException.name;
    Object.setPrototypeOf(this, ValueNotFoundInGameException.prototype);
  }
}

export class GameNotFoundException extends Error {
  public name: string;
  constructor() {
    super("Game not found, reload the page and try again.");
    this.name = ValueNotFoundInGameException.name;
    Object.setPrototypeOf(this, ValueNotFoundInGameException.prototype);
  }
}
