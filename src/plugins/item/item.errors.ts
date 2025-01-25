export class ItemAlreadyExistsError extends Error {
  constructor() {
    super("Item with the given url already exists.");
  }
}

export class TooManyItems extends Error {
  constructor() {
    super("User item limit has been reached.");
  }
}

export class NoApplicableExtractorError extends Error {
  constructor() {
    super("Url is not supported.");
  }
}

export class UserDoesNotExist extends Error {
  constructor() {
    super("User does not exist.");
  }
}
