import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { CreateUploadDto } from '../dto/create-upload.dto';
import { MEDIA_CONFIG } from '../config/media.config';
import { type MediaProvider } from '../interfaces/media-provider.interface';
import { Event } from '@/modules/events/entities/events.entity';
import { MediaValidationService } from './media-validation.service';

@Injectable()
export class MediaUploadService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        
        @Inject('MEDIA_PROVIDER')
        private readonly mediaProvider: MediaProvider,

        private readonly mediaValidationService: MediaValidationService,
    ) {}
    
    async authorizeUpload(organiserAccountId: string, dto: CreateUploadDto) {
        //check if event belongs to the user(organiser) for the event's media upload
        const event = await this.eventRepository.findOne({
            where: {
                id: dto.eventId,
                organiserAccountId,
            },
        });

        if (!event) {
            throw new NotFoundException('Event not available');
        };

        const config = MEDIA_CONFIG[dto.resource];

        if (!config) {
            throw new BadRequestException('Unsupported media resource');
        };

        //validate file properties if its meets resource criteria
        this.mediaValidationService.validateFile(
            dto.resource,
            dto.fileSize,
            dto.fileExtension,
            dto.mimeType
        );

        const folder = `yardticket/events/${event.id}/${config.folder}`;

        const { signature, timestamp } = this.mediaProvider.generateUploadSignature({
            folder,
            resourceType: config.type,
            allowedFormats: config.allowedFormats
        });

        return {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder,
            resourceType: config.type,
            allowedFormats: config.allowedFormats,
        };
    };
};