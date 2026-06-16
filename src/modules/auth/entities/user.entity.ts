import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity, Index, OneToOne } from "typeorm";
import { UserStatus } from "../enum/user-status";
import { UserProfile } from "@/modules/user-profile/entities/user-profile.entity";

@Entity('users')
export class User extends BaseEntity {
   @Index({unique: true})
   @Column()
   email!: string;

   // @Index({unique: true})
   // @Column()
   // phoneNumber!: string;

   @Index()
   @Column({type: 'varchar', default: UserStatus})
   status!: string;

   @Column({default: false})
   isEmailVerified!: string;
   
   // @Column({default: false})
   // isPhoneVerified!: string;

   @Column({ type: 'timestamp', nullable: true })
   lastLoginAt!: Date

   @OneToOne(()=> UserProfile, (profile) => profile.user)
   profile!: UserProfile
};