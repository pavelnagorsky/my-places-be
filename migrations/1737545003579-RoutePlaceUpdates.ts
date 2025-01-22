import { MigrationInterface, QueryRunner } from "typeorm";

export class RoutePlaceUpdates1737545003579 implements MigrationInterface {
    name = 'RoutePlaceUpdates1737545003579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_place\` ADD \`distance\` float NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`route_place\` ADD \`duration\` float NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_place\` DROP COLUMN \`duration\``);
        await queryRunner.query(`ALTER TABLE \`route_place\` DROP COLUMN \`distance\``);
    }

}
