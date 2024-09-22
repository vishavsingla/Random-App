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

interface Itinerary {
  id: number;
  details: string;
  recommendations: Recommendation[];
  preferences: {
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
  };
}

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  recommendations: Recommendation[];
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, recommendations }) => {
  return (
    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Your Itinerary</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {itinerary.id}</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          {recommendations.map((rec, index) => (
            <div key={index} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{rec.location_name}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <p className="mb-2"><strong>Description:</strong> {rec.description}</p>
                <p className="mb-2"><strong>Activities:</strong> {rec.activities}</p>
                <p className="mb-2"><strong>Accommodation:</strong> {rec.accommodation}</p>
                <p className="mb-2"><strong>Dining:</strong> {rec.dining_options}</p>
                <p className="mb-2"><strong>Transportation:</strong> {rec.transportation}</p>
                <p className="mb-2"><strong>Safety Tips:</strong> {rec.safety_tips}</p>
                <p className="mb-2"><strong>Budget Breakdown:</strong> {rec.budget_breakdown}</p>
                <p><strong>Tips:</strong> {rec.tips}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default ItineraryDisplay;