import { MigrationInterface, QueryRunner } from "typeorm";

export class RouteDetailsFloatType1736971922670 implements MigrationInterface {
    name = 'RouteDetailsFloatType1736971922670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`distance\``);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`distance\` float NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`duration\``);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`duration\` float NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`duration\``);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`duration\` decimal NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`distance\``);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`distance\` decimal NOT NULL DEFAULT '0'`);
    }

}
