export class ItemAlreadyExistsError extends Error {
  constructor() {
    super("Item with the given url already exists.");
  }
}

export class NoApplicableExtractorError extends Error {
  constructor() {
    super("Url is not supported.");
  }
}
