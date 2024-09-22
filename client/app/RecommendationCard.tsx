import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Recommendation {
  id: number;
  locationName: string;
  activities: string;
  accommodation: string;
  dining_options: string;
  transportation: string;
  safety_tips: string;
  budgetBreakdown: string;
  tips: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPrint: (rec: Recommendation) => void;
  darkMode: boolean;
}



const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onPrint, darkMode }) => {
  const renderList = (content: string): JSX.Element[] => {
    return content.split('*').filter(item => item.trim()).map((item, index) => (
      <li key={index} className="mb-1">{item.trim()}</li>
    ));
  };

  const categories: (keyof Recommendation)[] = ['activities', 'accommodation', 'dining_options', 'transportation', 'safety_tips', 'budgetBreakdown', 'tips'];

  return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`text-2xl ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
          {recommendation.locationName.replace(/^##\s*(?:Relaxation\s*)?Vacation Recommendation\s*\d*:\s*/, '')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => (
          <div key={category} className="space-y-2">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-500'}`}>
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
            </h3>
            <ul className={`list-disc pl-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {renderList(recommendation[category] as string)}
            </ul>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onPrint(recommendation)} 
          className={`w-full ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}`}
        >
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecommendationCard;