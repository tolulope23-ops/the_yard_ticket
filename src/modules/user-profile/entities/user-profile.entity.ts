import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @Index({ unique: true })
  @Column()
  userId!: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: false })
  state!: string;

  @Column({ nullable: true })
  profilePicture?: string;
};