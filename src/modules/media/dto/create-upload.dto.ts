import { IsEnum, IsNumber, IsString, IsUUID } from "class-validator";
import { MediaResource } from "../enum/media-resource.enum";

export class CreateUploadDto {
  @IsEnum(MediaResource)
  resource!: MediaResource;

  @IsUUID()
  eventId!: string;

  @IsNumber()
  fileSize!: number;

  @IsString()
  fileExtension!: string;

  @IsString()
  mimeType!: string;
};