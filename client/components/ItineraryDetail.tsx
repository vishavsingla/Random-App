// File: src/components/ItineraryDetail.tsx
'use client';
import { useState, useEffect } from 'react';
import { fetchItineraryById } from '@/utils/api';
import ItineraryDisplay from './ItineraryDisplay';

interface ItineraryDetailProps {
  token: string;
  itineraryId: number;
}

const ItineraryDetail = ({ token, itineraryId }: ItineraryDetailProps) => {
  const [itinerary, setItinerary] = useState<any>(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        const data = await fetchItineraryById(itineraryId, token);
        setItinerary(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadItinerary();
  }, [itineraryId, token]);

  if (loading) return <p>Loading itinerary...</p>;
  if (error) return <p>Error: {error}</p>;

  return <ItineraryDisplay itinerary={itinerary} recommendations={recommendations}/>;
};

export default ItineraryDetail;
