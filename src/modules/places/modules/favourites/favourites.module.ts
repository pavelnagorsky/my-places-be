import { forwardRef, Module } from "@nestjs/common";
import { FavouritesService } from "./favourites.service";
import { FavouritesController } from "./favourites.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlacesModule } from "../../places.module";
import { Favourite } from "./entities/favourite.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Favourite]),
    forwardRef(() => PlacesModule),
  ],
  controllers: [FavouritesController],
  providers: [FavouritesService],
})
export class FavouritesModule {}
