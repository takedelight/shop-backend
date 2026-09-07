import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.getOrThrow<string>('STORAGE_ENDPOINT'),
      region: this.configService.getOrThrow<string>('STORAGE_REGION'),
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('STORAGE_ACCESS_KEY'),
        secretAccessKey:
          this.configService.getOrThrow<string>('STORAGE_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
    this.bucketName = this.configService.getOrThrow<string>(
      'STORAGE_BUCKET_NAME',
    );
  }

  async moveFile(oldKey: string, newKey: string): Promise<void> {
    try {
      const copySource = encodeURIComponent(`${this.bucketName}/${oldKey}`);

      await this.s3Client.send(
        new CopyObjectCommand({
          Bucket: this.bucketName,
          CopySource: copySource,
          Key: newKey,
        }),
      );

      await this.deleteFile(oldKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new InternalServerErrorException(`Failed to move file: ${message}`);
    }
  }

  async getUploadUrl(
    folder: string,
    originalName: string,
    contentType: string,
  ) {
    const fileExtension = extname(originalName);
    const key = folder
      ? `${folder}/${crypto.randomUUID()}${fileExtension}`
      : `${crypto.randomUUID()}${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });

      return { url, key };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new InternalServerErrorException(
        `Failed to generate upload URL: ${message}`,
      );
    }
  }

  async getDownloadUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Failed to generate download URL: ${message}`,
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'NoSuchKey') {
        throw new InternalServerErrorException(
          `Failed to delete file: ${error.message}`,
        );
      }
    }
  }
}
