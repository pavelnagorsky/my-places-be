import { MigrationInterface, QueryRunner } from "typeorm";

export class ExcursionType1741286489130 implements MigrationInterface {
    name = 'ExcursionType1741286489130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_6871495372ef0185bf99960e402\` ON \`excursion_translation\``);
        await queryRunner.query(`DROP INDEX \`FK_017a98e167b5cd170fbf1dbc76f\` ON \`excursion\``);
        await queryRunner.query(`DROP INDEX \`FK_1885aa1054ebf6045a4654f1ea9\` ON \`excursion\``);
        await queryRunner.query(`DROP INDEX \`FK_28ce9a9e2eaea6e6704952929f4\` ON \`excursion_place_translation\``);
        await queryRunner.query(`DROP INDEX \`FK_30e6aedaaf68ef6c8b9d17c0cdd\` ON \`excursion_place_translation\``);
        await queryRunner.query(`DROP INDEX \`FK_1c60b06c2300786983d372cdbe7\` ON \`excursion_place\``);
        await queryRunner.query(`DROP INDEX \`FK_8064faf29ef38ca6deffbe15014\` ON \`excursion_place\``);
        await queryRunner.query(`ALTER TABLE \`excursion\` ADD \`type\` int NOT NULL`);
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
        await queryRunner.query(`ALTER TABLE \`excursion\` DROP COLUMN \`type\``);
        await queryRunner.query(`CREATE INDEX \`FK_8064faf29ef38ca6deffbe15014\` ON \`excursion_place\` (\`placeId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_1c60b06c2300786983d372cdbe7\` ON \`excursion_place\` (\`excursionId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_30e6aedaaf68ef6c8b9d17c0cdd\` ON \`excursion_place_translation\` (\`languageId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_28ce9a9e2eaea6e6704952929f4\` ON \`excursion_place_translation\` (\`excursionPlaceId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_1885aa1054ebf6045a4654f1ea9\` ON \`excursion\` (\`moderatorId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_017a98e167b5cd170fbf1dbc76f\` ON \`excursion\` (\`authorId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_6871495372ef0185bf99960e402\` ON \`excursion_translation\` (\`excursionId\`)`);
    }

}
