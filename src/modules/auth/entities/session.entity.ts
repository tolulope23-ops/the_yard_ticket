import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserAccount } from './user-account.entity';
import { BaseEntity } from '@/shared/entities/base.entity';

@Entity('sessions')
@Index(['accountId', 'isRevoked'])
export class Session extends BaseEntity{
  @Index()
  @Column()
  accountId!: string; 

  @Index()
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

  @ManyToOne(() => UserAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  userAccount!: UserAccount;
};