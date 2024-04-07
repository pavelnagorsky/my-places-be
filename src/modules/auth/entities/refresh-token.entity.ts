import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 5000 })
  token: string;

  @Column()
  expiryDate: Date;

  @Column({ type: 'varchar', length: 5000, nullable: true })
  userAgent: string | null;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;
}
