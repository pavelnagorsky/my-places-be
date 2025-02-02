import { MigrationInterface, QueryRunner } from "typeorm";

export class RouteUpdates1738332076218 implements MigrationInterface {
    name = 'RouteUpdates1738332076218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`timeStart\``);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`lastRouteLegDuration\` float NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`lastRouteLegDistance\` float NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`lastRouteLegDistance\``);
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`lastRouteLegDuration\``);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`timeStart\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    }

}
