import { Controller, Post, Get, UseInterceptors, UploadedFile, Req, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';

@Controller('v1/ai')
export class AiController {
  constructor(private readonly ragService: RagService) {}

  @Post('knowledge-base/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    // Fallback tenant ID for testing if TenantGuard is bypassed globally
    const tenantId = req.tenant?.id || 'default-tenant-123';
    
    return this.ragService.processFileAndIndex(tenantId, file.buffer, file.originalname);
  }

  @Get('knowledge-base/query')
  async queryDocs(@Query('q') query: string, @Req() req: any) {
    if (!query) throw new BadRequestException('Query parameter ?q= is required');
    
    const tenantId = req.tenant?.id || 'default-tenant-123';
    const results = await this.ragService.queryKnowledgeBase(tenantId, query);
    
    return { success: true, data: results };
  }
}
