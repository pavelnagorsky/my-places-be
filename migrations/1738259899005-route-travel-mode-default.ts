import { MigrationInterface, QueryRunner } from "typeorm";

export class RouteTravelModeDefault1738259899005 implements MigrationInterface {
    name = 'RouteTravelModeDefault1738259899005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`travelMode\` \`travelMode\` varchar(255) NOT NULL DEFAULT 'DRIVING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`travelMode\` \`travelMode\` varchar(255) NOT NULL`);
    }

}
