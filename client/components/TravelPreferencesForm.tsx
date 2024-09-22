'use client'

import React, { useState } from 'react';

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

interface FormProps {
  onSubmit: (preferences: Preferences) => void;
}

const TravelPreferencesForm: React.FC<FormProps> = ({ onSubmit }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    travel_type: '',
    budget: 0,
    local_budget: 0,
    trip_duration: 0,
    number_of_travelers: 1,
    traveling_with_children: false,
    interests: [],
    preferred_weather: [],
    other_requirements: '',
    residence_country: '',
    currency: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">Travel Type *</label>
        <select
          name="travel_type"
          value={preferences.travel_type}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">Select a travel type</option>
          <option value="leisure">Leisure</option>
          <option value="adventure">Adventure</option>
          <option value="cultural">Cultural</option>
          <option value="business">Business</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Total Budget (USD) *</label>
        <input
          type="number"
          name="budget"
          value={preferences.budget}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Local Budget (USD per day) *</label>
        <input
          type="number"
          name="local_budget"
          value={preferences.local_budget}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Trip Duration (days)</label>
        <input
          type="number"
          name="trip_duration"
          value={preferences.trip_duration}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Number of Travelers</label>
        <input
          type="number"
          name="number_of_travelers"
          value={preferences.number_of_travelers}
          onChange={handleChange}
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="traveling_with_children"
          checked={preferences.traveling_with_children}
          onChange={handleChange}
          className="rounded border-gray-300 text-indigo-600 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <span className="ml-2 text-sm text-gray-700">Traveling with Children</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Interests</label>
        <select
          multiple
          name="interests"
          value={preferences.interests}
          onChange={handleMultiSelect}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="beach">Beach</option>
          <option value="mountains">Mountains</option>
          <option value="city">City</option>
          <option value="history">History</option>
          <option value="food">Food</option>
          <option value="adventure">Adventure</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Weather</label>
        <select
          multiple
          name="preferred_weather"
          value={preferences.preferred_weather}
          onChange={handleMultiSelect}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="sunny">Sunny</option>
          <option value="rainy">Rainy</option>
          <option value="snowy">Snowy</option>
          <option value="mild">Mild</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Other Requirements</label>
        <textarea
          name="other_requirements"
          value={preferences.other_requirements}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Residence Country</label>
        <input
          type="text"
          name="residence_country"
          value={preferences.residence_country}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Currency</label>
        <input
          type="text"
          name="currency"
          value={preferences.currency}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Generate Itinerary
      </button>
    </form>
  );
};

export default TravelPreferencesForm;
