export type TripStatus = 'planned' | 'in-progress' | 'completed';

export interface Hotel {
  id: string;
  name: string;
  address: string;
  destinationId: string;
}

export interface Destination {
  id: string;
  tripId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  sequence: number;
  hotels: Hotel[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  destinations: Destination[];
}

export interface TripFormData {
  name: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
}

export interface DestinationFormData {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface HotelFormData {
  name: string;
  address: string;
}