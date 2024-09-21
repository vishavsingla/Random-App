import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    throw new Error('API key for Google Gemini is missing!');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Interfaces for input/output data
interface TravelPreferences {
    travel_type: string;
    budget: number;
    local_budget: number;
    interests: string[];
    trip_duration: number;
    number_of_travelers: number;
    traveling_with_children: boolean;
    preferred_weather: string[];
    other_requirements?: string;
    residence_country?: string;
    number_of_children?: number;
    currency?: string;
}

interface Itinerary {
    locations: string[];
    details: string;
}

// Helper function to generate prompt
function generatePrompt(preferences: TravelPreferences): string {
    return `Generate a detailed travel itinerary based on the following preferences:
    Residence Country: ${preferences.residence_country || 'INTERNATIONAL'}
    Travel Type: ${preferences.travel_type}
    Budget: $${preferences.budget}
    Local Budget: $${preferences.local_budget}
    Currency: ${preferences.currency || 'USD'}
    Interests: ${preferences.interests.join(', ')}
    Trip Duration: ${preferences.trip_duration} days
    Number of Travelers: ${preferences.number_of_travelers}
    Traveling with Children: ${preferences.traveling_with_children ? 'Yes' : 'No'}
    Number of Children: ${preferences.number_of_children || 0}
    Preferred Weather: ${preferences.preferred_weather.join(', ')}
    Other Requirements: ${preferences.other_requirements || 'None'}

    Also, please give some recommendations for hotels.
    Consider current world events, travel restrictions, and seasonal factors when suggesting destinations and activities.
    Provide a list of recommended locations and a detailed itinerary.
    `;
}

// Route to generate the itinerary
app.post('/generate_itinerary', async (req: Request, res: Response, next: NextFunction) => {
    const preferences: TravelPreferences = req.body;

    try {
        const prompt = generatePrompt(preferences);

        console.log('Generating itinerary for:', preferences);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // Call text() method to get the response as a string
        const itineraryText = await response.text();
        const locations = itineraryText
            .split('\n')
            .filter((line: string) => line.includes(':'))
            .map((line: string) => line.split(':')[0])
            .slice(0, 5);

        console.log('Itinerary generated with locations:', locations);

        const itinerary: Itinerary = {
            locations,
            details: itineraryText,
        };

        res.json(itinerary);
    } catch (error:any) {
        console.error('Error generating itinerary:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
