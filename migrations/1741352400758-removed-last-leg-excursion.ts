import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedLastLegExcursion1741352400758 implements MigrationInterface {
    name = 'RemovedLastLegExcursion1741352400758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`excursion\` DROP COLUMN \`lastRouteLegDistance\``);
        await queryRunner.query(`ALTER TABLE \`excursion\` DROP COLUMN \`lastRouteLegDuration\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`excursion\` ADD \`lastRouteLegDuration\` float NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`excursion\` ADD \`lastRouteLegDistance\` float NOT NULL DEFAULT '0'`);
    }

}
