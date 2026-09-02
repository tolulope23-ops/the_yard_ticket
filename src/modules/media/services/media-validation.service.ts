import { BadRequestException, Injectable } from '@nestjs/common';
import { MEDIA_CONFIG } from '../config/media.config';
import { MediaResource } from '../enum/media-resource.enum';
import { MediaType } from '../enum/media-type.enum';


@Injectable()
export class MediaValidationService {
    validateFile(resource: MediaResource, fileSize: number, fileExtension: string, mimeType: string) {
        const config = MEDIA_CONFIG[resource];

        if (!config) {
            throw new BadRequestException('Unsupported media resource');
        };

        if (fileSize > config.maxFileSize) {
            throw new BadRequestException(`File size exceeds the maximum allowed size of
                ${this.formatBytes(config.maxFileSize)}`,
            );
        };

        const extension = fileExtension.toLowerCase().replace('.', '');

        if (!config.allowedFormats.includes(extension)) {
            throw new BadRequestException(
                `Unsupported file format. Allowed formats: ${config.allowedFormats.join(', ')}`,
            );
        };

        this.validateMimeType(config.type, mimeType);

        return true;
    };

    private validateMimeType(mediaType: MediaType, mimeType: string) {
        if (mediaType === MediaType.IMAGE) {
            if (!mimeType.startsWith('image/')) {
                throw new BadRequestException('Expected an image file');
            }
        };

        if (mediaType === MediaType.VIDEO) {
            if (!mimeType.startsWith('video/')) {
                throw new BadRequestException('Expected a video file');
            };
        };
    };

    private formatBytes(bytes: number): string {
        const megabytes = bytes / (1024 * 1024);

        return `${megabytes} MB`;
    };
};