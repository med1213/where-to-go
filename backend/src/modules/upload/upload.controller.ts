import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService, UploadResult, MulterFile } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Media & Image Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @Post('image')
  @ApiOperation({ summary: 'Upload a single image and convert to WebP format' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image converted to WebP successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: MulterFile): Promise<UploadResult> {
    return this.uploadService.processAndSaveImage(file);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @Post('images')
  @ApiOperation({ summary: 'Upload multiple images (up to 10) and convert all to WebP format' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'All images converted to WebP successfully' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(@UploadedFiles() files: MulterFile[]): Promise<UploadResult[]> {
    return this.uploadService.processMultipleImages(files);
  }
}
