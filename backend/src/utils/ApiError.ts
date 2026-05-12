export class ApiError extends Error {
  statusCode: number;
  errors?: any[];
  stack?: string;

  constructor(statusCode: number, message: string, errors?: any[], stack?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.stack = stack;
    
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}