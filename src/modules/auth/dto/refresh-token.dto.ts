import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh-token',
    description: 'Refresh token issued for new session',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;
};