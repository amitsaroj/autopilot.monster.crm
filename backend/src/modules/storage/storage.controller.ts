import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file safely' })
  async upload(
    @TenantId() tenantId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf|csv|doc|docx|mp4|mp3|wav)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.storageService.upload(tenantId, file.buffer, file.originalname, file.mimetype);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file' })
  async delete(@TenantId() tenantId: string, @Param('key') key: string) {
    await this.storageService.delete(tenantId, key);
    return { success: true };
  }
}
