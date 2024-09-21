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

app.use(cors());
app.use(bodyParser.json());

const allowedOrigins = [
    'http://localhost:3000', // Localhost for development
    'https://your-production-domain.com', // Your production domain
  ];
  
  // CORS configuration to allow specific origins
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin, like mobile apps or curl
      if (!origin) return callback(null, true);
  
      // Check if the request origin is allowed
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
  
      return callback(null, true);
    },
    credentials: true, // If you want to allow cookies or authentication headers
  }));
  

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

function generatePrompt(preferences) {
  return `Based on the following travel preferences, generate 3 vacation recommendations:

Travel Preferences:
- Travel Type: ${preferences.travel_type}
- Budget: ${preferences.budget} ${preferences.currency}
- Local Budget: ${preferences.local_budget} ${preferences.currency}
- Interests: ${preferences.interests.join(', ')}
- Trip Duration: ${preferences.trip_duration} days
- Number of Travelers: ${preferences.number_of_travelers}
- Traveling with Children: ${preferences.traveling_with_children}
- Preferred Weather: ${preferences.preferred_weather.join(', ')}
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

async function storeRecommendations(itineraryId, responseText) {
    const recommendations = responseText.split(/(?=## Vacation Recommendation)/); // Split on the vacation recommendation headers
    
    for (const rec of recommendations) {
      if (!rec.trim()) continue;  // Skip empty recommendations
  
      // Initialize an empty recommendation object
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
  
      // Regex patterns to match each section in the response
      const patterns = {
        locationName: /## Vacation Recommendation \d+:\s*(.+)/,
        description: /\*\*Description:\*\*\s*([\s\S]*?)\n\n/,
        recommendedActivities: /\*\*Activities:\*\*\s*([\s\S]*?)\n\n/,
        accommodation: /\*\*Accommodation:\*\*\s*([\s\S]*?)\n\n/,
        diningOptions: /\*\*Dining Options:\*\*\s*([\s\S]*?)\n\n/,
        transportation: /\*\*Transportation:\*\*\s*([\s\S]*?)\n\n/,
        safetyTips: /\*\*Safety Tips:\*\*\s*([\s\S]*?)\n\n/,
        budgetBreakdown: /\*\*Budget Breakdown:\*\*\s*([\s\S]*?)\n\n/,
        tips: /\*\*Tips:\*\*\s*([\s\S]*?)\n\n/
      };
  
      // Apply the regex patterns to extract the fields
      for (const key in patterns) {
        const match = rec.match(patterns[key]);
        if (match) {
          recommendation[key] = match[1].trim();
        }
      }
  
      // Store the parsed recommendation into the database
      try {
        await prisma.recommendation.create({
          data: recommendation,
        });
  
        // Also store location in Location table
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
  

  app.post('/generate_itinerary', verifyToken, async (req, res) => {
    try {
      const loggedInUser = req.user;
      const preferences = req.body;
  
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
  
      const prompt = generatePrompt(preferences);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
  
      // Create Itinerary and Preferences
      const itinerary = await prisma.itinerary.create({
        data: {
          details: responseText,
          user: { connect: { id: user.id } },
          travelPrefs: {
            create: {
              travel_type: preferences.travel_type,
              budget: preferences.budget,
              local_budget: preferences.local_budget,
              trip_duration: preferences.trip_duration,
              number_of_travelers: preferences.number_of_travelers,
              traveling_with_children: preferences.traveling_with_children,
              other_requirements: preferences.other_requirements || '',
              residence_country: preferences.residence_country || '',
              currency: preferences.currency || '',
              interests: {
                create: (preferences.interests || []).map(interest => ({ name: interest })),
              },
              preferredWeather: {
                create: (preferences.preferred_weather || []).map(weather => ({ condition: weather })),
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
  
      // Store Recommendations and Locations
      await storeRecommendations(itinerary.id, responseText);
  
      // Fetch the stored recommendations
      const recommendations = await prisma.recommendation.findMany({
        where: { itineraryId: itinerary.id },
      });
  
      res.json({ itinerary, recommendations });
    } catch (error) {
      console.error('Error generating itinerary:', error);
      res.status(500).json({ error: 'An error occurred while generating the itinerary. Please try again.' });
    }
  });
  
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
  

// Example route to test user retrieval
app.get('/user', verifyToken, async (req, res) => {
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

app.post('/auth/google', async (req, res) => {
    const { tokenId } = req.body;
  
    // Verify the token with Google API
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  
    const payload = ticket.getPayload();
    const { sub, email, name } = payload; // Sub is the Google user ID
  
    // Check if the user already exists in your database
    let user = await User.findOne({ googleId: sub });
    if (!user) {
      // If user does not exist, create a new user
      user = new User({
        googleId: sub,
        email: email,
        name: name,
      });
      await user.save();
    }
  
    // Generate your own JWT or session token here
    const token = generateJWT(user);
  
    res.status(200).json({ token });
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});