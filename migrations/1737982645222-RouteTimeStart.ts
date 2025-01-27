import { MigrationInterface, QueryRunner } from "typeorm";

export class RouteTimeStart1737982645222 implements MigrationInterface {
    name = 'RouteTimeStart1737982645222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`timeStart\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`timeStart\``);
    }

}
