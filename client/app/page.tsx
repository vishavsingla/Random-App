'use client'

import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, Printer, Sun, Moon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';


interface TravelPreferences {
  travel_type: string;
  budget: string;
  trip_duration: string;
  number_of_travelers: string;
  traveling_with_children: boolean;
  residence_country: string;
  interests: string[];
  preferred_weather: string[];
  is_international: 'national' | 'international';
  other_requirements: string;
}

interface Recommendation {
  id: number;
  locationName: string;
  accommodation: string;
  diningOptions: string;
  transportation: string;
  recommendedActivities: string;
  safetyTips: string;
  budgetBreakdown: string;
  tips: string;
}

const travelTypes = ['Exploration', 'Relaxation', 'Adventure', 'Cultural', 'Luxury', 'Eco-friendly', 'Romantic', 'Family', 'Solo'];
const interests = ['Beach', 'Mountains', 'Cities', 'Food', 'History', 'Nature', 'Nightlife', 'Shopping', 'Art', 'Music', 'Sports', 'Wildlife'];
const weatherPreferences = ['Sunny', 'Warm', 'Cool', 'Cold', 'Snowy', 'Rainy', 'Tropical', 'Dry'];

const Wanderlust: React.FC = () => {

  const [formData, setFormData] = useState<TravelPreferences>({
    travel_type: '',
    budget: '',
    trip_duration: '',
    number_of_travelers: '1',
    traveling_with_children: false,
    residence_country: '',
    interests: [],
    preferred_weather: [],
    is_international: 'national',
    other_requirements: '',
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxGroupChange = (e: React.ChangeEvent<HTMLInputElement>, group: keyof TravelPreferences) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [group]: checked
        ? [...(prev[group] as string[]), name]
        : (prev[group] as string[]).filter((item) => item !== name),
    }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await axios.post<{ recommendations: Recommendation[] }>(
        'http://localhost:8000/generate_itinerary',
        formData
      );
      setRecommendations(response.data.recommendations);
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (recommendation: Recommendation) => {
    const printContent = `
      Location: ${recommendation.locationName}
      
      Accommodation:
      ${recommendation.accommodation}
      
      Dining:
      ${recommendation.diningOptions}
      
      Transportation:
      ${recommendation.transportation}
      
      Activities:
      ${recommendation.recommendedActivities}
      
      Safety:
      ${recommendation.safetyTips}
      
      Budget:
      ${recommendation.budgetBreakdown}
      
      Tips:
      ${recommendation.tips}
    `;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`<pre>${printContent}</pre>`);
    printWindow?.document.close();
    printWindow?.print();
  };
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };


  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-200`}>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Travel Itinerary</h1>
          <Button onClick={toggleTheme} variant="outline" size="icon">
            {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`text-2xl ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Travel Preferences</CardTitle>
          </CardHeader>
          <CardContent>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="travel_type" className="text-blue-200">Travel Type*</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('travel_type', value)}
                    value={formData.travel_type}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select travel type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      {travelTypes.map(type => (
                        <SelectItem key={type} value={type.toLowerCase()} className="text-white">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-blue-200">Budget (in USD)*</Label>
                  <Input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="trip_duration" className="text-blue-200">Trip Duration (days)*</Label>
                  <Input
                    type="number"
                    id="trip_duration"
                    name="trip_duration"
                    value={formData.trip_duration}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="number_of_travelers" className="text-blue-200">Number of Travelers</Label>
                  <Input
                    type="number"
                    id="number_of_travelers"
                    name="number_of_travelers"
                    value={formData.number_of_travelers}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="traveling_with_children"
                    checked={formData.traveling_with_children}
                    onCheckedChange={(checked) => handleSelectChange('traveling_with_children', checked.toString())}
                    className="border-blue-400"
                  />
                  <Label htmlFor="traveling_with_children" className="text-blue-200">Traveling with Children</Label>
                </div>

                <div>
                  <Label htmlFor="residence_country" className="text-blue-200">Residence Country</Label>
                  <Input
                    type="text"
                    id="residence_country"
                    name="residence_country"
                    value={formData.residence_country}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="col-span-2 pt-3">
                  <Label className="text-blue-200 mb-2 block">Interests</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {interests.map(interest => (
                      <div key={interest} className="flex items-center">
                        <Checkbox
                          id={interest}
                          name={interest.toLowerCase()}
                          checked={formData.interests.includes(interest.toLowerCase())}
                          onCheckedChange={(checked) => handleCheckboxGroupChange({ target: { name: interest.toLowerCase(), checked } } as any, 'interests')}
                          className="border-blue-400 mr-2"
                        />
                        <Label htmlFor={interest} className="text-sm text-blue-200">{interest}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 pt-2">
                  <Label className="text-blue-200 mb-2 block">Preferred Weather </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {weatherPreferences.map(weather => (
                      <div key={weather} className="flex items-center">
                        <Checkbox
                          id={weather}
                          name={weather.toLowerCase()}
                          checked={formData.preferred_weather.includes(weather.toLowerCase())}
                          onCheckedChange={(checked) => handleCheckboxGroupChange({ target: { name: weather.toLowerCase(), checked } } as any, 'preferred_weather')}
                          className="border-blue-400 mr-2"
                        />
                        <Label htmlFor={weather} className="text-sm text-blue-200">{weather}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* <div>
                <Label htmlFor="is_international" className="text-blue-200">Destination Type*</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('is_international', value as 'national' | 'international')} 
                  value={formData.is_international}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select destination type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700">
                    <SelectItem value="national" className="text-white">National</SelectItem>
                    <SelectItem value="international" className="text-white">International</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              </div>

              <div>
                <Label htmlFor="other_requirements" className="text-blue-200">Other Requirements</Label>
                <Textarea
                  id="other_requirements"
                  name="other_requirements"
                  value={formData.other_requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? 'Generating...' : 'Generate Recommendations'}
              </Button>
            </form>
          </CardContent>
        </Card>


        {error && (
          <Alert variant="destructive" className={`mt-6 ${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-200'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Recommendations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.id} className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardHeader>
                    <CardTitle className={`text-2xl ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>{rec.locationName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Clean the location name by removing the prefix "## Vacation Recommendation X:" */}
                    <p className="text-xl font-semibold mb-2">
                      {rec.locationName.replace(/^##\s*Vacation Recommendation\s*\d*:\s*/, '') || 'N/A'}
                    </p>
                    <p>Activities: {rec.recommendedActivities.replace(/\*\*/g, '').trim() || 'N/A'}</p>
                    <p>Accommodation: {rec.accommodation.replace(/\*\*/g, '').trim() || 'N/A'}</p>
                    <p>Dining Options: {rec.diningOptions.replace(/\*\*/g, '').trim() || 'N/A'}</p>
                    <p>Transportation: {rec.transportation.replace(/\*\*/g, '').trim() || 'N/A'}</p>
                    <p>Safety Tips: {rec.safetyTips.replace(/\*\*/g, '').trim() || 'N/A'}</p>
                    <p>Budget: {rec.budgetBreakdown.trim() || 'N/A'}</p>
                    <p>Tips: {rec.tips.replace(/\*\*/g, '').trim() || 'N/A'}</p>
                  </CardContent>

                  <CardFooter>
                    <Button onClick={() => handlePrint(rec)} className={`w-full ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}`}>
                      <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wanderlust;