import { MediaType } from "../enum/media-type.enum";

export interface MediaProvider {
    generateUploadSignature(params: {
        folder: string;
        resourceType: MediaType;
        allowedFormats: string[];
    }): {
        signature: string;
        timestamp: number
    };
};