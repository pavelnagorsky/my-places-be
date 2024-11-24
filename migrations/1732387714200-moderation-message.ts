import { MigrationInterface, QueryRunner } from "typeorm";

export class ModerationMessage1732387714200 implements MigrationInterface {
    name = 'ModerationMessage1732387714200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns
        await queryRunner.query(`ALTER TABLE \`review\` ADD \`newModerationMessage\` varchar(1500) NULL`);
        await queryRunner.query(`ALTER TABLE \`place\` ADD \`newModerationMessage\` varchar(1500) NULL`);

        // Copy data from old columns to new columns
        await queryRunner.query(`UPDATE \`review\` SET \`newModerationMessage\` = \`moderationMessage\``);
        await queryRunner.query(`UPDATE \`place\` SET \`newModerationMessage\` = \`moderationMessage\``);

        // Drop old columns
        await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`moderationMessage\``);
        await queryRunner.query(`ALTER TABLE \`place\` DROP COLUMN \`moderationMessage\``);

        // Rename new columns to old column names
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`newModerationMessage\` \`moderationMessage\` varchar(1500) NULL`);
        await queryRunner.query(`ALTER TABLE \`place\` CHANGE \`newModerationMessage\` \`moderationMessage\` varchar(1500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add old columns back
        await queryRunner.query(`ALTER TABLE \`review\` ADD \`oldModerationMessage\` varchar(255) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`place\` ADD \`oldModerationMessage\` varchar(255) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`);

        // Copy data from new columns to old columns
        await queryRunner.query(`UPDATE \`review\` SET \`oldModerationMessage\` = \`moderationMessage\``);
        await queryRunner.query(`UPDATE \`place\` SET \`oldModerationMessage\` = \`moderationMessage\``);

        // Drop new columns
        await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`moderationMessage\``);
        await queryRunner.query(`ALTER TABLE \`place\` DROP COLUMN \`moderationMessage\``);

        // Rename old columns back to original names
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`oldModerationMessage\` \`moderationMessage\` varchar(255) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`place\` CHANGE \`oldModerationMessage\` \`moderationMessage\` varchar(255) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`);
    }

}
