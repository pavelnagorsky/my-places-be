import { MigrationInterface, QueryRunner } from "typeorm";

export class ExcursionRegion1746790537335 implements MigrationInterface {
    name = 'ExcursionRegion1746790537335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`excursion\` ADD \`regionId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`excursion\` ADD CONSTRAINT \`FK_7848928ef77080b7addd3b365c4\` FOREIGN KEY (\`regionId\`) REFERENCES \`region\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`excursion\` DROP FOREIGN KEY \`FK_7848928ef77080b7addd3b365c4\``);
        await queryRunner.query(`ALTER TABLE \`excursion\` DROP COLUMN \`regionId\``);
    }

}
