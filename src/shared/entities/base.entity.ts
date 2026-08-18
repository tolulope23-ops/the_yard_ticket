import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @CreateDateColumn({type: 'timestamptz'})
  createdAt!: Date;

  @UpdateDateColumn({type: 'timestamptz'})
  updatedAt!: Date;

  @DeleteDateColumn({nullable: true, type: 'timestamptz'})
  deletedAt?: Date | null;
};