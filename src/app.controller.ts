import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'Check server status' })
  @ApiOkResponse({
    description: 'Server is working',
  })
  @Get('status')
  getStatus(): string {
    return 'OK';
  }
}
