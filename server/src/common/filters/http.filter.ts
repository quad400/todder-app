import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { JsonWebTokenError } from '@nestjs/jwt';
import { Response } from '../utils/response';
import { BusinessCode } from '../enums/response';

export class ValidationException extends HttpException {
  name = 'ValidationException';
}

@Catch()
export class HttpExceptions implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseBody: Response<any>;

    switch (true) {
      case exception instanceof ValidationException:
        const exceptionResponse = exception.getResponse();

        responseBody = new Response(
          false,
          BusinessCode.UNPROCESSED_ENTITY,
          'Request body validation failed',
          undefined,
          exceptionResponse,
        );
        break;
      case exception instanceof BadRequestException:
        responseBody = new Response(
          false,
          BusinessCode.BAD_REQUEST,
          'Bad request issue',
          undefined,
          exception.message,
        );
        break;

      case exception instanceof UnauthorizedException:
        responseBody = new Response(
          false,
          BusinessCode.UNAUTHORIZED,
          'Client do not have permission or grant to access this api',
          undefined,
          exception.message,
        );
        break;

      case exception instanceof ConflictException:
        responseBody = new Response(
          false,
          BusinessCode.CONFLICT,
          'Data with a unique value already exist',
          undefined,
          exception.message,
        );
        break;

      case exception instanceof NotFoundException:
        responseBody = new Response(
          false,
          BusinessCode.NOT_FOUND,
          'Request not found',
          undefined,
          exception.message,
        );
        break;

      case exception instanceof JsonWebTokenError:
        responseBody = new Response(
          false,
          BusinessCode.BAD_REQUEST,
          'JWT Error Occur, contact admin',
          undefined,
          exception.message,
        );
        break;

      default:
        responseBody = new Response(
          false,
          BusinessCode.BAD_REQUEST,
          'Internal server error, contact admin',
          undefined,
          exception.message,
        );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
