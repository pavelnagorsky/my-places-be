import { MigrationInterface, QueryRunner } from "typeorm";

export class ExcursionSlug1739798510874 implements MigrationInterface {
    name = 'ExcursionSlug1739798510874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`excursion_translation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`original\` tinyint NOT NULL DEFAULT 0, \`title\` varchar(300) NULL, \`description\` text NULL, \`languageId\` int NULL, \`excursionId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`excursion\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`slug\` varchar(255) NOT NULL, \`distance\` float NOT NULL DEFAULT '0', \`duration\` float NOT NULL DEFAULT '0', \`lastRouteLegDuration\` float NOT NULL DEFAULT '0', \`lastRouteLegDistance\` float NOT NULL DEFAULT '0', \`travelMode\` varchar(255) NOT NULL DEFAULT 'DRIVING', \`viewsCount\` int NOT NULL DEFAULT '0', \`status\` int NOT NULL DEFAULT '0', \`moderationMessage\` varchar(1500) NULL, \`authorId\` int NULL, \`moderatorId\` int NULL, UNIQUE INDEX \`IDX_f1c6ddfbb82c61c4b576a12d5f\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`excursion_place_translation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`original\` tinyint NOT NULL DEFAULT 0, \`description\` text NULL, \`languageId\` int NULL, \`excursionPlaceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`excursion_place\` (\`id\` int NOT NULL AUTO_INCREMENT, \`position\` tinyint NOT NULL DEFAULT '0', \`distance\` float NOT NULL DEFAULT '0', \`duration\` float NOT NULL DEFAULT '0', \`excursionDuration\` float NOT NULL DEFAULT '0', \`placeId\` int NULL, \`excursionId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`excursion_translation\` ADD CONSTRAINT \`FK_f4bf6db2dd3c67d888e36bf0f84\` FOREIGN KEY (\`languageId\`) REFERENCES \`language\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`excursion_translation\` ADD CONSTRAINT \`FK_6871495372ef0185bf99960e402\` FOREIGN KEY (\`excursionId\`) REFERENCES \`excursion\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`excursion\` ADD CONSTRAINT \`FK_017a98e167b5cd170fbf1dbc76f\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`excursion\` ADD CONSTRAINT \`FK_1885aa1054ebf6045a4654f1ea9\` FOREIGN KEY (\`moderatorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` ADD CONSTRAINT \`FK_30e6aedaaf68ef6c8b9d17c0cdd\` FOREIGN KEY (\`languageId\`) REFERENCES \`language\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` ADD CONSTRAINT \`FK_28ce9a9e2eaea6e6704952929f4\` FOREIGN KEY (\`excursionPlaceId\`) REFERENCES \`excursion_place\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`excursion_place\` ADD CONSTRAINT \`FK_8064faf29ef38ca6deffbe15014\` FOREIGN KEY (\`placeId\`) REFERENCES \`place\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`excursion_place\` ADD CONSTRAINT \`FK_1c60b06c2300786983d372cdbe7\` FOREIGN KEY (\`excursionId\`) REFERENCES \`excursion\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`excursion_place\` DROP FOREIGN KEY \`FK_1c60b06c2300786983d372cdbe7\``);
        await queryRunner.query(`ALTER TABLE \`excursion_place\` DROP FOREIGN KEY \`FK_8064faf29ef38ca6deffbe15014\``);
        await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` DROP FOREIGN KEY \`FK_28ce9a9e2eaea6e6704952929f4\``);
        await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` DROP FOREIGN KEY \`FK_30e6aedaaf68ef6c8b9d17c0cdd\``);
        await queryRunner.query(`ALTER TABLE \`excursion\` DROP FOREIGN KEY \`FK_1885aa1054ebf6045a4654f1ea9\``);
        await queryRunner.query(`ALTER TABLE \`excursion\` DROP FOREIGN KEY \`FK_017a98e167b5cd170fbf1dbc76f\``);
        await queryRunner.query(`ALTER TABLE \`excursion_translation\` DROP FOREIGN KEY \`FK_6871495372ef0185bf99960e402\``);
        await queryRunner.query(`ALTER TABLE \`excursion_translation\` DROP FOREIGN KEY \`FK_f4bf6db2dd3c67d888e36bf0f84\``);
        await queryRunner.query(`DROP TABLE \`excursion_place\``);
        await queryRunner.query(`DROP TABLE \`excursion_place_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_f1c6ddfbb82c61c4b576a12d5f\` ON \`excursion\``);
        await queryRunner.query(`DROP TABLE \`excursion\``);
        await queryRunner.query(`DROP TABLE \`excursion_translation\``);
    }

}
