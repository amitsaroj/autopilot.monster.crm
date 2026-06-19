import { Controller, Get, Post, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { QuoteLifecycleService } from './quote-lifecycle.service';

@ApiTags('CRM Quotes')
@Controller('crm/quotes')
export class QuotePublicController {
  constructor(private readonly quoteLifecycleService: QuoteLifecycleService) {}

  @Get('view/:token')
  @Public()
  @ApiOperation({ summary: 'Public quote view (no auth)' })
  async viewQuote(@Param('token') token: string) {
    const data = await this.quoteLifecycleService.getPublicView(token);
    return { status: 200, message: 'Quote retrieved', error: false, data };
  }

  @Post('view/:token/accept')
  @Public()
  @ApiOperation({ summary: 'Accept quote via public token' })
  async acceptQuote(@Param('token') token: string) {
    const data = await this.quoteLifecycleService.acceptByToken(token);
    return { status: 200, message: 'Quote accepted', error: false, data };
  }

  @Post('view/:token/decline')
  @Public()
  @ApiOperation({ summary: 'Decline quote via public token' })
  async declineQuote(@Param('token') token: string) {
    const data = await this.quoteLifecycleService.declineByToken(token);
    return { status: 200, message: 'Quote declined', error: false, data };
  }

  @Get('view/:token/pdf')
  @Public()
  @ApiOperation({ summary: 'Download quote PDF via public token' })
  async downloadPdf(@Param('token') token: string, @Res() res: Response): Promise<void> {
    const quote = await this.quoteLifecycleService.getByTokenForPdf(token);
    this.quoteLifecycleService.streamPdf(quote, res);
  }
}
