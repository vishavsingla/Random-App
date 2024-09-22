// File: src/components/SubmitItinerary.tsx
'use client'
import { useState } from 'react';
import { submitItinerary } from '@/utils/api';

interface SubmitItineraryProps {
  token: string;
}

const SubmitItinerary = ({ token }: SubmitItineraryProps) => {
  const [formData, setFormData] = useState<any>({
    // Add any fields required for the itinerary submission
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      await submitItinerary(token, formData);
      setSuccess(true);
      setError(null);
    } catch (error:any) {
      setError(error.message);
      setSuccess(false);
    }
  };

  return (
    <div>
      {success ? <p>Itinerary submitted successfully!</p> : null}
      {error ? <p>Error: {error}</p> : null}

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Itinerary
      </button>
    </div>
  );
};

export default SubmitItinerary;
