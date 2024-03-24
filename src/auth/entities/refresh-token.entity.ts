import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 'MAX' })
  token: string;

  @Column()
  expiryDate: Date;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  userAgent: string | null;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;
}
