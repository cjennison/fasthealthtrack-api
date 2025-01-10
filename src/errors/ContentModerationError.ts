class ContentModerationError extends Error {
  errorCode: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ContentModerationError';
    this.errorCode = 'content_moderation';
    this.statusCode = 400; // Bad Request
    Object.setPrototypeOf(this, ContentModerationError.prototype);
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

export default ContentModerationError;
