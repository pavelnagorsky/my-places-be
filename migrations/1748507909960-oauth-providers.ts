import { MigrationInterface, QueryRunner } from "typeorm";

export class OauthProviders1748507909960 implements MigrationInterface {
    name = 'OauthProviders1748507909960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`googleUserId\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`yandexUserId\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`vkUserId\` varchar(100) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`vkUserId\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`yandexUserId\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`googleUserId\``);
    }

}
