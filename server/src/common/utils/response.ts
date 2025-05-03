import { BusinessCode } from '../enums/response';

export class Response<T> {
  constructor(
    public success: boolean,
    public statusCode: BusinessCode,
    public message: string,
    public data?: T | undefined,
    public errors?: any | undefined,
  ) {}
}
