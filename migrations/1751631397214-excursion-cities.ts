import { MigrationInterface, QueryRunner } from "typeorm";

export class ExcursionCities1751631397214 implements MigrationInterface {
  name = "ExcursionCities1751631397214";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`city_translation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`original\` tinyint NOT NULL DEFAULT 0, \`title\` varchar(300) NULL, \`languageId\` int NULL, \`cityId\` int NULL, INDEX \`IDX_916e6fa87ac3ec7d258cb2838f\` (\`title\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`city\` (\`id\` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`excursion\` ADD \`cityId\` int NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`city_translation\` ADD CONSTRAINT \`FK_69faf6a4777825121434215f6df\` FOREIGN KEY (\`languageId\`) REFERENCES \`language\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`city_translation\` ADD CONSTRAINT \`FK_73abb3f3cda29a668335ce36e09\` FOREIGN KEY (\`cityId\`) REFERENCES \`city\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`excursion\` ADD CONSTRAINT \`FK_11565b0340a3eead25b5761fec8\` FOREIGN KEY (\`cityId\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`excursion\` DROP FOREIGN KEY \`FK_11565b0340a3eead25b5761fec8\``
    );
    await queryRunner.query(
      `ALTER TABLE \`city_translation\` DROP FOREIGN KEY \`FK_73abb3f3cda29a668335ce36e09\``
    );
    await queryRunner.query(
      `ALTER TABLE \`city_translation\` DROP FOREIGN KEY \`FK_69faf6a4777825121434215f6df\``
    );
    await queryRunner.query(`ALTER TABLE \`excursion\` DROP COLUMN \`cityId\``);
    await queryRunner.query(`DROP TABLE \`city\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_916e6fa87ac3ec7d258cb2838f\` ON \`city_translation\``
    );
    await queryRunner.query(`DROP TABLE \`city_translation\``);
  }
}
