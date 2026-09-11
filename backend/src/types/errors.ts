export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class IdentityProviderUnavailableError extends Error {
  constructor() {
    super('Identity provider unavailable');
    this.name = 'IdentityProviderUnavailableError';
  }
}
