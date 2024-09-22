import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8000;

// const corsOptions = {
//   origin: ["http://localhost:3000"],
//   credentials: true,
//   optionSuccessStatus: 200,
// };

const allowedOrigins = ['https://random-app-gamma.vercel.app', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionSuccessStatus: 200
};


app.use(bodyParser.json());
app.use(cors(corsOptions));

app.options('*', cors(corsOptions));


app.use(express.json());



// Google OAuth setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('API key for Google Gemini is missing!');
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Helper function to generate guest usernames
async function getOrCreateGuestUser() {
  let guestCount = await prisma.user.count({ where: { email: { contains: '@guest.com' } } });
  const guestEmail = `guest${guestCount + 1}@guest.com`;
  return prisma.user.create({
    data: { name: `Guest ${guestCount + 1}`, email: guestEmail },
  });
}

// Middleware to verify Google token and extract user information
async function verifyToken(req, res, next) {
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

// Function to generate the prompt based on preferences
function generatePrompt(preferences) {
  return `Based on the following travel preferences, generate 3 vacation recommendations:

Travel Preferences:
- Travel Type: ${preferences.travel_type}
- Budget: ${preferences.budget} ${preferences.currency}
- Local Budget: ${preferences.local_budget} ${preferences.currency}
- Interests: ${preferences.interests}
- Trip Duration: ${preferences.trip_duration} days
- Number of Travelers: ${preferences.number_of_travelers}
- Traveling with Children: ${preferences.traveling_with_children}
- Preferred Weather: ${preferences.preferred_weather}
- Other Requirements: ${preferences.other_requirements || 'None'}
- Residence Country: ${preferences.residence_country || 'Not Specified'}

For each recommendation, provide the following information in a structured format:

Location Name:
Description:
Activities:
Accommodation:
Dining Options:
Transportation:
Safety Tips:
Budget Breakdown:
- Flights:
- Accommodation:
- Food:
- Activities:
Tips:

Please ensure each section is on a new line and clearly labeled.`;
}

// Modify this to capture and store locations
async function storeRecommendations(itineraryId, responseText) {
  const recommendations = responseText.split(/(?=## Vacation Recommendation)/);

  for (const rec of recommendations) {
    if (!rec.trim()) continue;

    const recommendation = {
      itineraryId,
      locationName: '',
      description: '',
      recommendedActivities: '',
      accommodation: '',
      diningOptions: '',
      transportation: '',
      safetyTips: '',
      budgetBreakdown: '',
      tips: ''
    };

    const patterns = {
      locationName: /^([^\n]+)/m,
      description: /Description:\s*([\s\S]*?)\n\n/,
      recommendedActivities: /Activities:\s*([\s\S]*?)\n\n/,
      accommodation: /Accommodation:\s*([\s\S]*?)\n\n/,
      diningOptions: /Dining Options:\s*([\s\S]*?)\n\n/,
      transportation: /Transportation:\s*([\s\S]*?)\n\n/,
      safetyTips: /Safety Tips:\s*([\s\S]*?)\n\n/,
      budgetBreakdown: /Budget Breakdown:\s*([\s\S]*?)\n\n/,
      tips: /Tips:\s*([\s\S]*?)\n\n/
    };

    for (const key in patterns) {
      const match = rec.match(patterns[key]);
      if (match) {
        recommendation[key] = match[1].trim();
      }
    }

    try {
      const createdRec = await prisma.recommendation.create({
        data: recommendation,
      });

      await prisma.location.create({
        data: {
          name: recommendation.locationName,
          itineraryId,
        },
      });
    } catch (error) {
      console.error(`Error storing recommendation for ${recommendation.locationName}:`, error);
    }
  }
}

app.post('/login', async (req, res) => {
  let { token } = req.body;
  console.log(token);
  token = token.replace('Bearer ', '');
  console.log(token);
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;

    let user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email },
    });

    res.json({ user, token });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});


app.post('/generate_itinerary', verifyToken, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const preferences = req.body;

    let user;
    if (loggedInUser?.email) {
      user = await prisma.user.upsert({
        where: { email: loggedInUser.email },
        update: {},
        create: { name: loggedInUser.name || 'Guest', email: loggedInUser.email || '' },
      });
    } else {
      user = await getOrCreateGuestUser();
    }

    // Parse budget and trip_duration
    const parsedBudget = parseFloat(preferences.budget) || 0; // Fallback to 0
    const parsedTripDuration = parseFloat(preferences.trip_duration) || 1; // Prevent division by zero
    const local_budget = parsedTripDuration > 0 ? parsedBudget / parsedTripDuration : 0; // Calculate local_budget

    // Parse number_of_travelers as Int
    const numberOfTravelers = parseInt(preferences.number_of_travelers, 10) || 1; // Fallback to 1

    const prompt = generatePrompt(preferences);
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    const itinerary = await prisma.itinerary.create({
      data: {
        details: responseText,
        user: { connect: { id: user.id } },
        travelPrefs: {
          create: {
            travel_type: preferences.travel_type,
            budget: parsedBudget, // Pass as Float
            trip_duration: parsedTripDuration, // Pass as Float
            local_budget: local_budget, // Pass as Float
            number_of_travelers: numberOfTravelers, // Pass as Int
            traveling_with_children: preferences.traveling_with_children,
            other_requirements: preferences.other_requirements || '',
            residence_country: preferences.residence_country || '',
            currency: preferences.currency || '',
            interests: {
              create: preferences.interests.map((interest) => ({
                name: interest,
              })),
            },
            preferredWeather: {
              create: preferences.preferred_weather.map((weather) => ({
                condition: weather,
              })),
            },
            user: { connect: { id: user.id } }
          }
        }
        
      },
      include: {
        travelPrefs: {
          include: {
            interests: true,
            preferredWeather: true,
          }
        }
      }
    });

    await storeRecommendations(itinerary.id, responseText);

    const recommendations = await prisma.recommendation.findMany({
      where: { itineraryId: itinerary.id },
    });

    res.json({ itinerary, recommendations });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'An error occurred while generating the itinerary. Please try again.' });
  }
});



// Route to fetch itineraries for the logged-in user
app.get('/itineraries', verifyToken, async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser?.email) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const user = await prisma.user.findUnique({ where: { email: loggedInUser.email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const itineraries = await prisma.itinerary.findMany({
      where: { userId: user.id },
      include: {
        recommendations: true,
        travelPrefs: {
          include: { interests: true, preferredWeather: true },
        },
      },
    });

    res.json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ error: 'Error fetching itineraries' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
