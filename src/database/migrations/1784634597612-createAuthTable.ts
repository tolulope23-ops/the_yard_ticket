import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTable1784634597612 implements MigrationInterface {
    name = 'CreateAuthTable1784634597612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "status" character varying NOT NULL DEFAULT 'pending', "accountType" character varying NOT NULL DEFAULT 'regularUser', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_204e9b624861ff4a5b26819210" ON "users" ("createdAt") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_e456a497674a1886ddbdc93228" ON "users" ("accountType") `);
        await queryRunner.query(`CREATE TYPE "public"."user_accounts_accounttype_enum" AS ENUM('regularUser', 'organizer')`);
        await queryRunner.query(`CREATE TABLE "user_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "accountType" "public"."user_accounts_accounttype_enum" NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "lastLoginAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_125e915cf23ad1cfb43815ce59b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_85af267f6f6903f310443d0ec2" ON "user_accounts" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_5444cbc69ec79153e46821b72b" ON "user_accounts" ("accountType") `);
        await queryRunner.query(`CREATE INDEX "IDX_af00665cb930e09206ee9df412" ON "user_accounts" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_e16c43f353aa7596f375245440" ON "user_accounts" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cbeb9473363350d7913e0c5134" ON "user_accounts" ("userId", "accountType") `);
        await queryRunner.query(`CREATE TYPE "public"."verification_tokens_type_enum" AS ENUM('email_verification', 'password_reset', 'change_email', 'change_phone')`);
        await queryRunner.query(`CREATE TABLE "verification_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "codeHash" character varying NOT NULL, "type" "public"."verification_tokens_type_enum" NOT NULL, "attemptsCount" integer NOT NULL DEFAULT '0', "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "usedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f2d4d7a2aa57ef199e61567db22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_00aca59fa49e6a6fd1927622d6" ON "verification_tokens" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_8eb720a87e85b20fdfc69c3826" ON "verification_tokens" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_13aae16b664d1269ae2504e140" ON "verification_tokens" ("expiresAt") `);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "accountId" uuid NOT NULL, "refreshTokenHash" character varying NOT NULL, "deviceName" character varying, "userAgent" character varying, "ipAddress" character varying, "expiresAt" TIMESTAMP NOT NULL, "lastUsedAt" TIMESTAMP, "isRevoked" boolean NOT NULL DEFAULT false, "revokedAt" TIMESTAMP, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_48c850446dde10a9f20c8468b4" ON "sessions" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_6fee377066ebeed22567e4390e" ON "sessions" ("accountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b08788ca45cbd90f0bd96c2f07" ON "sessions" ("refreshTokenHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_50762206f116cd47d1c3fec396" ON "sessions" ("expiresAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_66d768dac5fc0222ba5397885c" ON "sessions" ("accountId", "isRevoked") `);
        await queryRunner.query(`CREATE TYPE "public"."auth_credentials_provider_enum" AS ENUM('LOCAL', 'GOOGLE')`);
        await queryRunner.query(`CREATE TABLE "auth_credentials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "accountId" uuid NOT NULL, "provider" "public"."auth_credentials_provider_enum" NOT NULL, "externalProviderId" character varying, "identifier" character varying NOT NULL, "passwordHash" character varying, "lastUsedAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_bc4c948d232c874a583c520b26e" UNIQUE ("accountId", "provider"), CONSTRAINT "UQ_ce868dd99830a44a9b9b5518723" UNIQUE ("provider", "externalProviderId"), CONSTRAINT "PK_90fdced0865b5f15586e7cd3b25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_21dbb3c62f874be112ff63dee1" ON "auth_credentials" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_aa998ab253b0ba9dce1c43354b" ON "auth_credentials" ("accountId") `);
        await queryRunner.query(`ALTER TABLE "user_accounts" ADD CONSTRAINT "FK_e16c43f353aa7596f375245440a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verification_tokens" ADD CONSTRAINT "FK_8eb720a87e85b20fdfc69c38269" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_6fee377066ebeed22567e4390ee" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth_credentials" ADD CONSTRAINT "FK_aa998ab253b0ba9dce1c43354bf" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_credentials" DROP CONSTRAINT "FK_aa998ab253b0ba9dce1c43354bf"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_6fee377066ebeed22567e4390ee"`);
        await queryRunner.query(`ALTER TABLE "verification_tokens" DROP CONSTRAINT "FK_8eb720a87e85b20fdfc69c38269"`);
        await queryRunner.query(`ALTER TABLE "user_accounts" DROP CONSTRAINT "FK_e16c43f353aa7596f375245440a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aa998ab253b0ba9dce1c43354b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_21dbb3c62f874be112ff63dee1"`);
        await queryRunner.query(`DROP TABLE "auth_credentials"`);
        await queryRunner.query(`DROP TYPE "public"."auth_credentials_provider_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66d768dac5fc0222ba5397885c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_50762206f116cd47d1c3fec396"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b08788ca45cbd90f0bd96c2f07"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6fee377066ebeed22567e4390e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48c850446dde10a9f20c8468b4"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13aae16b664d1269ae2504e140"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8eb720a87e85b20fdfc69c3826"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_00aca59fa49e6a6fd1927622d6"`);
        await queryRunner.query(`DROP TABLE "verification_tokens"`);
        await queryRunner.query(`DROP TYPE "public"."verification_tokens_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cbeb9473363350d7913e0c5134"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e16c43f353aa7596f375245440"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af00665cb930e09206ee9df412"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5444cbc69ec79153e46821b72b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85af267f6f6903f310443d0ec2"`);
        await queryRunner.query(`DROP TABLE "user_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."user_accounts_accounttype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e456a497674a1886ddbdc93228"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_204e9b624861ff4a5b26819210"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
