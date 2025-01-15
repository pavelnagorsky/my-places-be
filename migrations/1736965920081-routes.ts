import { MigrationInterface, QueryRunner } from 'typeorm';

export class Routes1736965920081 implements MigrationInterface {
  name = 'Routes1736965920081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`route\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(500) NOT NULL DEFAULT '', \`coordinatesStart\` varchar(255) NOT NULL, \`coordinatesEnd\` varchar(255) NOT NULL, \`distance\` decimal NOT NULL DEFAULT '0', \`duration\` decimal NOT NULL DEFAULT '0', \`authorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`route_place\` (\`id\` int NOT NULL AUTO_INCREMENT, \`position\` tinyint NOT NULL DEFAULT '0', \`placeId\` int NULL, \`routeId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`route\` ADD CONSTRAINT \`FK_6f8b6b55cdf82e2349805db384d\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`route_place\` ADD CONSTRAINT \`FK_55dd4827c720c6630d602e86bae\` FOREIGN KEY (\`placeId\`) REFERENCES \`place\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`route_place\` ADD CONSTRAINT \`FK_fce56f70e55e712ac16232739d7\` FOREIGN KEY (\`routeId\`) REFERENCES \`route\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`route_place\` DROP FOREIGN KEY \`FK_fce56f70e55e712ac16232739d7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`route_place\` DROP FOREIGN KEY \`FK_55dd4827c720c6630d602e86bae\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`route\` DROP FOREIGN KEY \`FK_6f8b6b55cdf82e2349805db384d\``,
    );
    await queryRunner.query(`DROP TABLE \`route_place\``);
    await queryRunner.query(`DROP TABLE \`route\``);
  }
}
