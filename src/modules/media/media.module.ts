import { Module } from '@nestjs/common';
import { CloudinaryMediaProvider } from './providers/cloudinary/cloudinary.provider';
import { MediaUploadService } from './services/media-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaValidationService } from './services/media-validation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Event]),
    ],
    providers: [
        {
            provide: 'MEDIA_PROVIDER',  
            useClass: CloudinaryMediaProvider,
        },
        
        MediaUploadService, MediaValidationService
    ],
    exports: [MediaUploadService],
})
export class MediaModule {}