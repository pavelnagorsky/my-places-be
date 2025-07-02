import { MigrationInterface, QueryRunner } from "typeorm";

export class ExcursionLikesComments1751289081680 implements MigrationInterface {
  name = "ExcursionLikesComments1751289081680";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename existing tables
    await queryRunner.query(`RENAME TABLE \`like\` TO \`place_like\``);
    await queryRunner.query(`RENAME TABLE \`comment\` TO \`place_comment\``);

    // Create new excursion-related tables
    await queryRunner.query(`CREATE TABLE \`excursion_like\` (
         \`id\` int NOT NULL AUTO_INCREMENT, 
         \`userId\` int NULL,
         \`excursionId\` int NULL,
         PRIMARY KEY (\`id\`)
     ) ENGINE=InnoDB`);

    await queryRunner.query(`CREATE TABLE \`excursion_comment\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`text\` varchar(1000) NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`userId\` int NULL,
        \`excursionId\` int NULL,
        PRIMARY KEY (\`id\`)
     ) ENGINE=InnoDB`);

    // Add likesCount column to excursion
    await queryRunner.query(
      `ALTER TABLE \`excursion\` ADD \`likesCount\` int NOT NULL DEFAULT '0'`
    );

    // Add foreign keys for excursion tables
    await queryRunner.query(`
            ALTER TABLE \`excursion_like\`
                ADD CONSTRAINT \`FK_fe0801d022fd23f9c1aa137b09d\`
                    FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`)
                        ON DELETE NO ACTION ON UPDATE NO ACTION`);

    await queryRunner.query(`
            ALTER TABLE \`excursion_like\`
                ADD CONSTRAINT \`FK_f46a75b86d60276e1aab98021aa\`
                    FOREIGN KEY (\`excursionId\`) REFERENCES \`excursion\`(\`id\`)
                        ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`
            ALTER TABLE \`excursion_comment\`
                ADD CONSTRAINT \`FK_bce4b1984f8410c160a13c5e0a5\`
                    FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`)
                        ON DELETE NO ACTION ON UPDATE NO ACTION`);

    await queryRunner.query(`
            ALTER TABLE \`excursion_comment\`
                ADD CONSTRAINT \`FK_3078830afca697f5a67476a36a3\`
                    FOREIGN KEY (\`excursionId\`) REFERENCES \`excursion\`(\`id\`)
                        ON DELETE CASCADE ON UPDATE NO ACTION`);

    // Update foreign key names for renamed tables to match new convention
    await queryRunner.query(`
            ALTER TABLE \`place_like\`
                ADD CONSTRAINT \`FK_c27ae65340d3d7557d7c9b23b25\`
                    FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`)
                        ON DELETE NO ACTION ON UPDATE NO ACTION`);

    await queryRunner.query(`
            ALTER TABLE \`place_like\`
                ADD CONSTRAINT \`FK_aad327a5f3dbec99a9e893d2d86\`
                    FOREIGN KEY (\`placeId\`) REFERENCES \`place\`(\`id\`)
                        ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`
            ALTER TABLE \`place_comment\`
                ADD CONSTRAINT \`FK_ed6ce2aface7165b4c385b0bcb1\`
                    FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`)
                        ON DELETE NO ACTION ON UPDATE NO ACTION`);

    await queryRunner.query(`
            ALTER TABLE \`place_comment\`
                ADD CONSTRAINT \`FK_7155441785a4e9d939c3eac5a13\`
                    FOREIGN KEY (\`placeId\`) REFERENCES \`place\`(\`id\`)
                        ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(
      `ALTER TABLE \`place_comment\` DROP FOREIGN KEY \`FK_7155441785a4e9d939c3eac5a13\``
    );
    await queryRunner.query(
      `ALTER TABLE \`place_comment\` DROP FOREIGN KEY \`FK_ed6ce2aface7165b4c385b0bcb1\``
    );
    await queryRunner.query(
      `ALTER TABLE \`place_like\` DROP FOREIGN KEY \`FK_aad327a5f3dbec99a9e893d2d86\``
    );
    await queryRunner.query(
      `ALTER TABLE \`place_like\` DROP FOREIGN KEY \`FK_c27ae65340d3d7557d7c9b23b25\``
    );
    await queryRunner.query(
      `ALTER TABLE \`excursion_comment\` DROP FOREIGN KEY \`FK_3078830afca697f5a67476a36a3\``
    );
    await queryRunner.query(
      `ALTER TABLE \`excursion_comment\` DROP FOREIGN KEY \`FK_bce4b1984f8410c160a13c5e0a5\``
    );
    await queryRunner.query(
      `ALTER TABLE \`excursion_like\` DROP FOREIGN KEY \`FK_f46a75b86d60276e1aab98021aa\``
    );
    await queryRunner.query(
      `ALTER TABLE \`excursion_like\` DROP FOREIGN KEY \`FK_fe0801d022fd23f9c1aa137b09d\``
    );

    // Drop new tables and column
    await queryRunner.query(
      `ALTER TABLE \`excursion\` DROP COLUMN \`likesCount\``
    );
    await queryRunner.query(`DROP TABLE \`excursion_comment\``);
    await queryRunner.query(`DROP TABLE \`excursion_like\``);

    // Rename tables back to original names
    await queryRunner.query(`RENAME TABLE \`place_like\` TO \`like\``);
    await queryRunner.query(`RENAME TABLE \`place_comment\` TO \`comment\``);
  }
}
