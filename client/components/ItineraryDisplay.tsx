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
  
  interface ItineraryDisplayProps {
    itinerary: Itinerary;
  }
  
  const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
    return (
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Itinerary</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {itinerary.id}</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            {itinerary.recommendations.map((recommendation, index) => (
              <div key={index} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{recommendation.locationName}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p className="mb-2"><strong>Description:</strong> {recommendation.description}</p>
                  <p className="mb-2"><strong>Activities:</strong> {recommendation.recommendedActivities}</p>
                  <p className="mb-2"><strong>Accommodation:</strong> {recommendation.accommodation}</p>
                  <p className="mb-2"><strong>Dining:</strong> {recommendation.diningOptions}</p>
                  <p className="mb-2"><strong>Transportation:</strong> {recommendation.transportation}</p>
                  <p className="mb-2"><strong>Safety Tips:</strong> {recommendation.safetyTips}</p>
                  <p className="mb-2"><strong>Budget Breakdown:</strong> {recommendation.budgetBreakdown}</p>
                  <p><strong>Tips:</strong> {recommendation.tips}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  };
  
  export default ItineraryDisplay;
  