import { MigrationInterface, QueryRunner } from "typeorm";

export class RouteTravelMode1738259823479 implements MigrationInterface {
    name = 'RouteTravelMode1738259823479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`travelMode\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`travelMode\``);
    }

}
