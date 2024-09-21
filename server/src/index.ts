import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient, User, TravelPreferences } from '@prisma/client';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

// Google OAuth setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('API key for Google Gemini is missing!');
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Custom types for `req.user`
interface CustomRequest extends Request {
  user?: {
    email?: string | null;
    name?: string | null;
  };
}

// Helper function to generate guest usernames
async function getOrCreateGuestUser() {
  let guestCount = await prisma.user.count({ where: { email: null } });
  const guestName = `guest${guestCount + 1}`;
  return prisma.user.create({
    data: { name: guestName, email: null },
  });
}

// Middleware to verify Google token and extract user information
async function verifyToken(req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (payload) {
        req.user = {
          email: payload.email || null,
          name: payload.name || 'Guest',
        };
      }
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    req.user = { email: null, name: 'Guest' };
  }
  next();
}



// Helper function to generate a prompt for the Google Gemini API
function generatePrompt(preferences) {
  return `## Travel Preferences:
- Travel Type: ${preferences.travel_type}
- Budget: ${preferences.budget}
- Local Budget: ${preferences.local_budget}
- Interests: ${preferences.interests.join(', ')}
- Trip Duration: ${preferences.trip_duration} days
- Number of Travelers: ${preferences.number_of_travelers}
- Traveling with Children: ${preferences.traveling_with_children}
- Preferred Weather: ${preferences.preferred_weather.join(', ')}
- Other Requirements: ${preferences.other_requirements || 'None'}
- Residence Country: ${preferences.residence_country || 'Not Specified'}
- Currency: ${preferences.currency || 'Not Specified'}`;
}

// Helper to extract and store recommendations
async function storeRecommendations(itineraryId, recommendations) {
  for (const rec of recommendations) {
    const [location, description, ...details] = rec.split('\n');
    const recommendation = {
      itineraryId,
      locationName: location,
      description: description,
      recommendedActivities: details[0] || '',
      accommodation: details[1] || '',
      diningOptions: details[2] || '',
      transportation: details[3] || '',
      safetyTips: details[4] || '',
      currency: details[5] || 'USD',
    };
    await prisma.recommendation.create({
      data: recommendation,
    });
  }
}

// Route to generate itinerary
app.post('/generate_itinerary', verifyToken, async (req: CustomRequest, res: Response) => {
  try {
    const loggedInUser = req.user;

    let user;
    if (loggedInUser?.email) {
      user = await prisma.user.upsert({
        where: { email: loggedInUser.email },
        update: {},
        create: { name: loggedInUser.name || 'Guest', email: loggedInUser.email },
      });
    } else {
      user = await getOrCreateGuestUser();
    }

    const preferences = req.body;

    const prompt = generatePrompt(preferences);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const itinerary = await prisma.itinerary.create({
      data: {
        travelPrefs: {
          create: {
            travel_type: preferences.travel_type,
            budget: preferences.budget,
            local_budget: preferences.local_budget,
            trip_duration: preferences.trip_duration,
            number_of_travelers: preferences.number_of_travelers,
            traveling_with_children: preferences.traveling_with_children,
            other_requirements: preferences.other_requirements,
            residence_country: preferences.residence_country,
            currency: preferences.currency,
            userId: user.id,
          },
        },
        details: responseText,
        userId: user.id,
      },
    });

    const recommendations = responseText.split('\n\n'); // Adjust this based on your response format
    await storeRecommendations(itinerary.id, recommendations);

    res.json(itinerary);
  } catch (error:any) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Example route to test user retrieval
app.get('/user', verifyToken, async (req: CustomRequest, res: Response) => {
  if (req.user && req.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } else {
    res.status(400).json({ message: 'No user logged in' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
