// import {v2 as cloudinary} from 'cloudinary';

// export const CloudinaryProvider = {
//     provide: 'CLOUDINARY',
//     userFactory: ()=> {
//         cloudinary.config({
//             cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//             api_key: process.env.CLOUDINARY_API_KEY,
//             api_secret: process.env.CLOUDINARY_API_SECRET,
//         });

//         return cloudinary
//     }
// };

import { v2 as cloudinary } from 'cloudinary';
import { MediaProvider } from '../../interfaces/media-provider.interface';
import { MediaType } from '../../enum/media-type.enum';

export class CloudinaryMediaProvider implements MediaProvider {
    generateUploadSignature(params: {folder: string, resourceType: MediaType,  allowedFormats: string[]}) {

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request({
        folder: params.folder,
        timestamp
    },
        process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      signature,
      timestamp,
    };
  };
};