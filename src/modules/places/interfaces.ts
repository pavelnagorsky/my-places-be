import { Place } from './entities/place.entity';

export interface ISearchServiceResponse {
  places: Place[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
}
