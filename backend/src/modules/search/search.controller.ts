import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across collections' })
  async search(
    @TenantId() tenantId: string,
    @Query('q') query: string,
    @Query('collection') collection: string = 'all'
  ) {
    return this.searchService.search(tenantId, collection, query);
  }

  @Post('reindex')
  @ApiOperation({ summary: 'Trigger reindexing for a collection' })
  async reindex(@TenantId() tenantId: string, @Body() body: { collection: string }) {
      console.log(`Reindexing ${body.collection} for ${tenantId}`);
      return { success: true };
  }
}
