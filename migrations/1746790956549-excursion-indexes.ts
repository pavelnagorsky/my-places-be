import { MigrationInterface, QueryRunner } from "typeorm";

export class ExcursionIndexes1746790956549 implements MigrationInterface {
  name = "ExcursionIndexes1746790956549";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Rename existing column
    await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` 
                            CHANGE \`description\` \`description_temp\` text NULL`);

    // 2. Add new VARCHAR column
    await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` 
                            ADD \`description\` varchar(700) NULL`);

    // 3. Copy data from old to new column
    await queryRunner.query(`UPDATE \`excursion_place_translation\` 
                            SET \`description\` = \`description_temp\``);

    // 4. Create indexes
    await queryRunner.query(`CREATE INDEX \`IDX_a24a4f683628cdf32f5c5d50c7\` 
                            ON \`excursion_place_translation\` (\`description\`)`);
    await queryRunner.query(`CREATE INDEX \`IDX_29e0b5ced3d0d68d881856945a\` 
                            ON \`excursion_translation\` (\`title\`)`);

    // 5. Drop temporary column
    await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` 
                            DROP COLUMN \`description_temp\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First drop indexes
    await queryRunner.query(`DROP INDEX \`IDX_29e0b5ced3d0d68d881856945a\` 
                            ON \`excursion_translation\``);
    await queryRunner.query(`DROP INDEX \`IDX_a24a4f683628cdf32f5c5d50c7\` 
                            ON \`excursion_place_translation\``);

    // Add temporary column for TEXT data
    await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` 
                            ADD \`description_text\` text NULL`);

    // Copy data from VARCHAR to TEXT column
    await queryRunner.query(`UPDATE \`excursion_place_translation\` 
                            SET \`description_text\` = \`description\``);

    // Drop the VARCHAR column
    await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` 
                            DROP COLUMN \`description\``);

    // Rename the TEXT column back to original name
    await queryRunner.query(`ALTER TABLE \`excursion_place_translation\` 
                            CHANGE \`description_text\` \`description\` text NULL`);
  }
}
