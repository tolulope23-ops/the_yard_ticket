export interface ErrorResponse{
    success: false;
    statusCode: number;
    message: string | string[];
    timestamp: string;
    path: string;

    error?: string;
    stack?: string;
};