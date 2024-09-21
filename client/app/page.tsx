'use client';

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import TravelPreferencesForm from '@/components/TravelPreferencesForm';
import ItineraryDisplay from '@/components/ItineraryDisplay';

interface User {
  name: string;
  id_token: string;
}

interface Preferences {
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

interface Recommendation {
  locationName: string;
  description: string;
  recommendedActivities: string;
  accommodation: string;
  diningOptions: string;
  transportation: string;
  safetyTips: string;
  budgetBreakdown: string;
  tips: string;
}

interface Itinerary {
  id: number;
  details: string;
  recommendations: Recommendation[];
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });
        setUser({ name: res.data.name, id_token: response.access_token });
      } catch (err) {
        console.error(err);
      }
    },
    onError: (error) => console.error('Login Failed:', error),
  });

  const handleGenerateItinerary = async (preferences: Preferences) => {
    try {
      const response = await axios.post<Itinerary>('http://localhost:8000/generate_itinerary', preferences, {
        headers: {
          Authorization: user ? `Bearer ${user.id_token}` : '',
        },
      });
      setItinerary(response.data);
    } catch (error) {
      console.error('Error generating itinerary:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-4xl sm:mx-auto w-full px-4 sm:px-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Travel Recommendation App</h1>

          {!user ? (
            <div className="flex justify-center mb-8">
              <button onClick={() => login()} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Login with Google (Optional)
              </button>
            </div>
          ) : (
            <p className="text-xl text-center mb-8">Welcome, {user.name}!</p>
          )}

          {/* Always show the Travel Preferences Form regardless of login status */}
          <TravelPreferencesForm onSubmit={handleGenerateItinerary} />

          {/* Show Itinerary only if generated */}
          {itinerary && <ItineraryDisplay itinerary={itinerary} />}
        </div>
      </div>
    </div>
  );
}
