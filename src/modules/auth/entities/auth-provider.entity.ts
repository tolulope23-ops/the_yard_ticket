import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { AuthProviderName } from '../enum/auth-provider-name.enum';

@Entity('auth_providers')
export class AuthProvider extends BaseEntity {
  @Index({ unique: true })
  @Column({
    type: 'varchar',
  })
  name!: AuthProviderName;

  @Column({ default: true })
  isActive!: boolean;
};