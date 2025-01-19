export class EmailAlreadyTaken extends Error {
  constructor() {
    super("Email already taken.");
  }
}

export class IncorrectCredentials extends Error {
  constructor() {
    super("Incorrect credentials.");
  }
}
