import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';
import { User } from './user.entity';

@Entity('sessions')
export class Session extends BaseEntity{
  @Index()
  @Column()
  userId!: string;

  @Column({ select: false })
  refreshTokenHash!: string;

  @Column({ nullable: true })
  deviceName?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Index()
  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ default: false })
  isRevoked!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
};