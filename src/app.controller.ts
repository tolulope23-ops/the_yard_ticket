import { Controller, Get, } from '@nestjs/common';
import {ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('YardTicket API')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'App Health' })
  getAppInfo() {
    return {
      name: 'YardTicket API',
      description: 'Backend API for YardTicket',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      docs: '/docs'
    };
  };
};