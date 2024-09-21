// File: src/components/ItineraryList.tsx
'use client';
import { useState, useEffect } from 'react';
import { fetchItineraries } from '@/utils/api';

interface Itinerary {
  id: string;
  travelPrefs: {
    travel_type: string;
  };
  createdAt: string;
}

interface ItineraryListProps {
  token: string;
}

const ItineraryList = ({ token }: ItineraryListProps) => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  useEffect(() => {
    const loadItineraries = async () => {
      try {
        const data = await fetchItineraries(token);
        setItineraries(data);
      } catch (error) {
        console.error('Error fetching itineraries:', error);
      }
    };
    loadItineraries();
  }, [token]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Itineraries</h2>
      <ul className="space-y-4">
        {itineraries.map((itinerary) => (
          <li key={itinerary.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900">{itinerary.travelPrefs.travel_type}</h3>
            <p className="mt-1 text-sm text-gray-500">Created on: {new Date(itinerary.createdAt).toLocaleDateString()}</p>
            {/* Add more itinerary details as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItineraryList;