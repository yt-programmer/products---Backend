class appError extends Error {
  constructor() {
    super();
  }
  create(msg, statusCode, statusText) {
    this.statusText = statusText;
    this.statusCode = statusCode;
    this.msg = msg;
    return this;
  }
}

module.exports = new appError();
