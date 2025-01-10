class InvalidTokenError extends Error {
  errorCode: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidTokenError';
    this.errorCode = 'invalid_token';
    this.statusCode = 401; // Bad Request
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      statusCode: this.statusCode,
    };
  }
}

export default InvalidTokenError;
