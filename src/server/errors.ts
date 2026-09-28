export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "You need to sign in to continue.") {
    super(message, "UNAUTHENTICATED");
  }
}
