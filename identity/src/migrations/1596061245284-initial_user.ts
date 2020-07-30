import {MigrationInterface, QueryRunner} from "typeorm";

export class initialUser1596061245284 implements MigrationInterface {
    name = 'initialUser1596061245284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "emailVerified" boolean NOT NULL DEFAULT false, "phoneNumber" character varying NOT NULL, "phoneNumberVerified" boolean NOT NULL DEFAULT false, "givenName" character varying NOT NULL, "familyName" character varying NOT NULL, "locale" character varying(8), "totpSecret" character varying NOT NULL, "totpRecovery" character varying NOT NULL, "dateJoined" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_f2578043e491921209f5dadd080" UNIQUE ("phoneNumber"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
