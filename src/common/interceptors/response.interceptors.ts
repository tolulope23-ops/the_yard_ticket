import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class ResponseInterceptors implements NestInterceptor{
    intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {

        return next.handle().pipe(
            map((response) => ({
                success: true,
                message: response?.message ?? 'Request processed successfully',
                data: response?.data ?? response,
            })
        ));
    };
};