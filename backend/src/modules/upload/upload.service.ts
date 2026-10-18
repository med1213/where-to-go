import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  filename: string;
  originalName: string;
  size: number;
  format: string;
}

@Injectable()
export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async processAndSaveImage(file: MulterFile): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No image file provided');
    }

    // Validate mime type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/avif', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (JPEG, PNG, WEBP, AVIF, GIF) are allowed');
    }

    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 8);
    const baseName = `place_${timestamp}_${randomHex}`;
    const filename = `${baseName}.webp`;
    const thumbFilename = `thumb_${baseName}.webp`;

    const outputPath = path.join(this.uploadDir, filename);
    const thumbPath = path.join(this.uploadDir, thumbFilename);

    try {
      // 1. Convert main image to high quality WebP (max width 1920px)
      await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(outputPath);

      // 2. Generate optimized thumbnail WebP (480x320 cover)
      await sharp(file.buffer)
        .resize(480, 320, { fit: 'cover', position: 'center' })
        .webp({ quality: 75 })
        .toFile(thumbPath);

      const stats = fs.statSync(outputPath);

      return {
        url: `http://localhost:4000/uploads/${filename}`,
        thumbnailUrl: `http://localhost:4000/uploads/${thumbFilename}`,
        filename,
        originalName: file.originalname,
        size: stats.size,
        format: 'webp',
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to process and convert image to WebP: ${err.message}`);
    }
  }

  async processMultipleImages(files: MulterFile[]): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }
    return Promise.all(files.map((file) => this.processAndSaveImage(file)));
  }
}
