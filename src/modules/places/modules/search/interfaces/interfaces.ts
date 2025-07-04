export interface IGoogleDirectionsApiResponse {
  geocoded_waypoints: IGeocodedWaypoint[];
  routes: IRoute[];
  status: string | 'OK';
}

interface IGeocodedWaypoint {
  geocoder_status: string;
  place_id: string;
  types: string[];
}
interface IRoute {
  bounds: IBounds;
  copyrights: string;
  legs: ILeg[];
  overview_polyline: IPolyline;
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}
interface IBounds {
  northeast: ILatLng;
  southwest: ILatLng;
}
interface ILatLng {
  lat: number;
  lng: number;
}
interface ILeg {
  distance: IDistance;
  duration: IDuration;
  end_address: string;
  end_location: ILatLng;
  start_address: string;
  start_location: ILatLng;
  steps: IStep[];
  traffic_speed_entry: any[];
  via_waypoint: any[];
}
interface IDistance {
  text: string;
  value: number;
}
interface IDuration {
  text: string;
  value: number;
}
interface IStep {
  distance: IDistance;
  duration: IDuration;
  end_location: ILatLng;
  html_instructions: string;
  polyline: IPolyline;
  start_location: ILatLng;
  travel_mode: string;
  maneuver?: string;
}
interface IPolyline {
  points: string;
}
