export abstract class AuthServiceError extends Error {
  name = "AuthServiceError";
}

export class UsernameAlreadyTaken extends AuthServiceError {
  constructor() {
    super("Username already taken.");
  }
}

export class IncorrectCredentials extends AuthServiceError {
  constructor() {
    super("Incorrect username or password.");
  }
}

export class UserInactive extends AuthServiceError {
  constructor() {
    super("Account not activated. Ask Mati to activate it.");
  }
}
