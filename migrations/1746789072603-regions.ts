import { MigrationInterface, QueryRunner } from "typeorm";

export class Regions1746789072603 implements MigrationInterface {
    name = 'Regions1746789072603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`region\` (\`id\` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`region_translation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`original\` tinyint NOT NULL DEFAULT 0, \`title\` varchar(300) NULL, \`languageId\` int NULL, \`regionId\` int NULL, INDEX \`IDX_b94da146369dcf00df5e5482ed\` (\`title\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`region_translation\` ADD CONSTRAINT \`FK_2d214c73caad8ba5bf4b8fdd770\` FOREIGN KEY (\`languageId\`) REFERENCES \`language\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`region_translation\` ADD CONSTRAINT \`FK_2832b1b08af92c259f228312a13\` FOREIGN KEY (\`regionId\`) REFERENCES \`region\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`region_translation\` DROP FOREIGN KEY \`FK_2832b1b08af92c259f228312a13\``);
        await queryRunner.query(`ALTER TABLE \`region_translation\` DROP FOREIGN KEY \`FK_2d214c73caad8ba5bf4b8fdd770\``);
        await queryRunner.query(`DROP INDEX \`IDX_b94da146369dcf00df5e5482ed\` ON \`region_translation\``);
        await queryRunner.query(`DROP TABLE \`region_translation\``);
        await queryRunner.query(`DROP TABLE \`region\``);
    }

}
