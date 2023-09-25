import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from '../../images/entities/image.entity';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../../entities/admin.entity';
import { Place } from '../../places/entities/place.entity';
import { PlaceStatusesEnum } from '../../places/enums/place-statuses.enum';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  title: number;

  @Column({ type: 'int', unique: true })
  description: number;

  @ManyToOne(() => Place, (place) => place.reviews)
  place: Place;

  @Column({ default: PlaceStatusesEnum.MODERATION })
  status: PlaceStatusesEnum;

  @OneToMany(() => Image, (image) => image.review, { cascade: true })
  images: Image[];

  @ManyToOne(() => User, (user) => user.places)
  author: User;

  @ManyToOne(() => Admin, (admin) => admin.places)
  admin: Admin;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
