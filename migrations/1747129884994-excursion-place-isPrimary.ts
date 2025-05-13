import { MigrationInterface, QueryRunner } from "typeorm";

export class ExcursionPlaceIsPrimary1747129884994 implements MigrationInterface {
    name = 'ExcursionPlaceIsPrimary1747129884994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`excursion_place\` ADD \`isPrimary\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`excursion_place\` DROP COLUMN \`isPrimary\``);
    }

}
