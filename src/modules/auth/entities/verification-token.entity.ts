import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { VerificationTokenType } from '../enum/verification-token-type.enum';
import { BaseEntity } from '@/shared/entities/base.entity';

@Entity('verification_tokens')
export class VerificationToken extends BaseEntity{
  @Index()
  @Column()
  userId!: string;

  @Column({ select: false })
  codeHash!: string;

  @Column({type: 'enum', enum: VerificationTokenType})
  type!: VerificationTokenType;

  @Column({ default: 0 })
  attemptsCount!: number;

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt?: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
};