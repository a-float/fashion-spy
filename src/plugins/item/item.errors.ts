export abstract class ItemServiceError extends Error {
  name = "ItemServiceError";
}

export class ItemAlreadyExistsError extends ItemServiceError {
  constructor() {
    super("Item with the given url already exists.");
  }
}

export class TooManyItems extends ItemServiceError {
  constructor() {
    super("User item limit has been reached.");
  }
}

export class NoApplicableExtractorError extends ItemServiceError {
  constructor() {
    super("Url is not supported.");
  }
}

export class UserDoesNotExist extends ItemServiceError {
  constructor() {
    super("User does not exist.");
  }
}

export class ItemNotFound extends ItemServiceError {
  constructor() {
    super("Item not found.");
  }
}

export class CantFetchStatusError extends ItemServiceError {
  constructor() {
    super(`Failed to fetch item. :(`);
  }
}
