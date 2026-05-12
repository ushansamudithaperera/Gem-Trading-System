export class ApiResponse {
  success: boolean;
  statusCode: number;
  data: any;
  message: string;

  constructor(statusCode: number, data: any, message: string = 'Success') {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}