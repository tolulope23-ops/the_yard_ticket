import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';

import { MediaUploadService } from '../services/media-upload.service';
import { CreateUploadDto } from '../dto/create-upload.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('media/uploads')
export class MediaUploadController {
    constructor(private readonly mediaUploadService: MediaUploadService) {}
    
    @UseGuards(JwtAuthGuard)
    @Post('autho')
    async authorizeUpload(@Req() req: any, @Body() dto: CreateUploadDto) {
        const organiserAccountId = req.user.organiserAccountId;

        return this.mediaUploadService.authorizeUpload(organiserAccountId, dto);
    };
};