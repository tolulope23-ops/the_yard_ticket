import { MediaResource } from "../enum/media-resource.enum";
import { MediaType } from "../enum/media-type.enum";

export const MEDIA_CONFIG = {
    [MediaResource.EVENT_BANNER]: {
        type: MediaType.IMAGE,
        folder: 'banner',
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    },

    [MediaResource.TICKET_IMAGE]: {
        type: MediaType.IMAGE,
        folder: 'tickets',
        maxFileSize: 3 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    },

    [MediaResource.EVENT_GALLERY]: {
        type: MediaType.IMAGE,
        folder: 'gallery',
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    },

    [MediaResource.EVENT_VIDEO]: {
        type: MediaType.VIDEO,
        folder: 'videos',
        maxFileSize: 100 * 1024 * 1024,
        allowedFormats: ['mp4', 'mov', 'webm'],
    }
};