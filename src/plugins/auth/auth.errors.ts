export class UsernameAlreadyTaken extends Error {
  constructor() {
    super("Username already taken.");
  }
}

export class IncorrectCredentials extends Error {
  constructor() {
    super("Incorrect username or password.");
  }
}

export class UserInactive extends Error {
  constructor() {
    super("Account not activated. Ask Mati to activate it.");
  }
}
