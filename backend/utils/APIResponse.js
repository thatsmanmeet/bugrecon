class APIResponse {
  constructor(
    statusCode,
    message = 'success',
    data = null,
    successCode = null
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = this.statusCode < 400;
    this.successCode = successCode;
  }
}

export { APIResponse };
