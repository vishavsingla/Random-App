'use client'

import React from 'react';

interface Recommendation {
  location_name: string;
  description: string;
  activities: string;
  accommodation: string;
  dining_options: string;
  transportation: string;
  safety_tips: string;
  budget_breakdown: string;
  tips: string;
}

interface TravelPreferences {
  travel_type: string;
  budget: number;
  local_budget: number;
  trip_duration: number;
  number_of_travelers: number;
  traveling_with_children: boolean;
  interests: string[];
  preferred_weather: string[];
  other_requirements: string;
  residence_country: string;
  currency: string;
}

interface Itinerary {
  id: number;
  details: string;
  recommendations: Recommendation[];
  preferences: TravelPreferences;
}

interface ItineraryListProps {
  itineraries: Itinerary[];
}

const ItineraryList: React.FC<ItineraryListProps> = ({ itineraries }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Itineraries</h2>
      {itineraries.length === 0 ? (
        <p>No itineraries created yet.</p>
      ) : (
        <ul className="space-y-4">
          {itineraries.map((itinerary) => (
            <li key={itinerary.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900">
                {itinerary.preferences.travel_type} Trip
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Created on: {new Date(itinerary.id).toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Destinations: {itinerary.recommendations.map(rec => rec.location_name).join(', ')}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Duration: {itinerary.preferences.trip_duration} days
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Budget: {itinerary.preferences.budget} {itinerary.preferences.currency}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ItineraryList;