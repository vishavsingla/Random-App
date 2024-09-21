// File: src/utils/api.ts
const BASE_URL = 'http://localhost:8000';

// Helper function to handle API requests
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Fetch all itineraries for a specific user (use the token to authenticate the request)
export const fetchItineraries = async (token: string) => {
  const response = await fetch(`${BASE_URL}/itineraries`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
};

// Fetch specific itinerary details by ID
export const fetchItineraryById = async (id: number, token: string) => {
  const response = await fetch(`${BASE_URL}/itineraries/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
};

// Submit a new itinerary (after generating it)
export const submitItinerary = async (token: string, itineraryData: any) => {
  const response = await fetch(`${BASE_URL}/itineraries`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itineraryData),
  });
  return handleApiResponse(response);
};
