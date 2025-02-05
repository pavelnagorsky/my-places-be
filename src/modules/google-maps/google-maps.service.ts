import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TravelModesEnum } from '../routes/enums/travel-modes.enum';
import { IGoogleCloudConfig } from '../../config/configuration';
import { firstValueFrom } from 'rxjs';
import { IGoogleDirectionsApiResponse } from '../search/interfaces/interfaces';

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger('Google maps service');
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getLatLng(coordinates: string) {
    const latLng = coordinates.split(';');
    const lat = latLng[0] ? +latLng[0] : 1;
    const lng = latLng[1] ? +latLng[1] : 1;
    return {
      lat,
      lng,
    };
  }

  async getRouteDetails(
    startCoordinates: string,
    endCoordinates: string,
    waypointsCoordinates: string[],
    travelMode: TravelModesEnum,
  ) {
    const startLatLng = this.getLatLng(startCoordinates);
    const endLatLng = this.getLatLng(endCoordinates);
    const waypoints = waypointsCoordinates.map((c) => this.getLatLng(c));
    // Create waypoints string
    const waypointsString = waypoints
      .map((wp) => `${wp.lat},${wp.lng}`)
      .join('|');
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
      startLatLng.lat
    },${startLatLng.lng}&destination=${endLatLng.lat},${
      endLatLng.lng
    }&waypoints=${waypointsString}&mode=${travelMode.toLowerCase()}&key=${
      this.configService.get<IGoogleCloudConfig>('googleCloud')?.apiKey
    }`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IGoogleDirectionsApiResponse>(url),
      );
      if (data.status === 'OK' && !!data.routes) {
        const route = data.routes[0];
        const distanceLegs = route.legs.map((leg) => leg.distance.value / 1000); // KM
        const durationLegs = route.legs.map((leg) => leg.duration.value / 60); // Minutes
        const totalDistance = distanceLegs.reduce(
          (prev, current) => prev + (current ?? 0),
          0,
        );
        const totalDuration = durationLegs.reduce(
          (prev, current) => prev + (current ?? 0),
          0,
        );

        const lastRouteLeg = route.legs[route.legs.length - 1];
        const lastRouteLegDistance = lastRouteLeg.distance.value / 1000; // KM
        const lastRouteLegDuration = lastRouteLeg.duration.value / 60; // Minutes

        return {
          distanceLegs,
          durationLegs,
          totalDistance,
          totalDuration,
          lastRouteLegDistance,
          lastRouteLegDuration,
        };
      } else {
        throw data;
      }
    } catch (e) {
      this.logger.error(`Error fetching paths`, e);
      throw new BadRequestException({
        message: 'Incorrect route coordinates',
      });
    }
  }
}
