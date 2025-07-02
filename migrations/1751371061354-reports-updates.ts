import { MigrationInterface, QueryRunner } from "typeorm";

export class ReportsUpdates1751371061354 implements MigrationInterface {
    name = 'ReportsUpdates1751371061354'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`place_like\` DROP FOREIGN KEY \`FK_015cc6116dcf6ae69089ba32619\``);
        await queryRunner.query(`ALTER TABLE \`place_like\` DROP FOREIGN KEY \`FK_e8fb739f08d47955a39850fac23\``);
        await queryRunner.query(`ALTER TABLE \`place_comment\` DROP FOREIGN KEY \`FK_626b946a1fa685a361665ccb238\``);
        await queryRunner.query(`ALTER TABLE \`place_comment\` DROP FOREIGN KEY \`FK_c0354a9a009d3bb45a08655ce3b\``);
        await queryRunner.query(`ALTER TABLE \`report\` ADD \`entityType\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`report\` ADD \`excursionId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`report\` ADD CONSTRAINT \`FK_bf8db61d022e791ad8cc62ddbc0\` FOREIGN KEY (\`excursionId\`) REFERENCES \`excursion\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`report\` DROP FOREIGN KEY \`FK_bf8db61d022e791ad8cc62ddbc0\``);
        await queryRunner.query(`ALTER TABLE \`report\` DROP COLUMN \`excursionId\``);
        await queryRunner.query(`ALTER TABLE \`report\` DROP COLUMN \`entityType\``);
        await queryRunner.query(`ALTER TABLE \`place_comment\` ADD CONSTRAINT \`FK_c0354a9a009d3bb45a08655ce3b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`place_comment\` ADD CONSTRAINT \`FK_626b946a1fa685a361665ccb238\` FOREIGN KEY (\`placeId\`) REFERENCES \`place\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`place_like\` ADD CONSTRAINT \`FK_e8fb739f08d47955a39850fac23\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`place_like\` ADD CONSTRAINT \`FK_015cc6116dcf6ae69089ba32619\` FOREIGN KEY (\`placeId\`) REFERENCES \`place\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
