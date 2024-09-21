import { Request } from 'express';

export interface TravelPreferences {
  travel_type: string;
  budget: number;
  local_budget: number;
  interests: string[];
  trip_duration: number;
  number_of_travelers: number;
  traveling_with_children: boolean;
  preferred_weather: string[];
  other_requirements?: string;
  residence_country?: string;
  number_of_children?: number;
  currency?: string;
}

export interface CustomRequest extends Request {
  body: TravelPreferences;
}
