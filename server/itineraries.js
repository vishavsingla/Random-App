
// Get all itineraries for a user
app.get('/itineraries', verifyToken, async (req, res) => {
    try {
      const itineraries = await prisma.itinerary.findMany({
        where: { userId: req.user.id },
        include: { recommendations: true, travelPrefs: true },
      });
      res.json(itineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      res.status(500).json({ error: 'An error occurred while fetching itineraries.' });
    }
  });
  
  // Get a specific itinerary
  app.get('/itineraries/:id', verifyToken, async (req, res) => {
    try {
      const itinerary = await prisma.itinerary.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { recommendations: true, travelPrefs: true },
      });
      if (itinerary) {
        res.json(itinerary);
      } else {
        res.status(404).json({ message: 'Itinerary not found' });
      }
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      res.status(500).json({ error: 'An error occurred while fetching the itinerary.' });
    }
  });
  
  // Update an itinerary
  app.put('/itineraries/:id', verifyToken, async (req, res) => {
    try {
      const updatedItinerary = await prisma.itinerary.update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
        include: { recommendations: true, travelPrefs: true },
      });
      res.json(updatedItinerary);
    } catch (error) {
      console.error('Error updating itinerary:', error);
      res.status(500).json({ error: 'An error occurred while updating the itinerary.' });
    }
  });
  
  // Delete an itinerary
  app.delete('/itineraries/:id', verifyToken, async (req, res) => {
    try {
      await prisma.itinerary.delete({
        where: { id: parseInt(req.params.id) },
      });
      res.json({ message: 'Itinerary deleted successfully' });
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      res.status(500).json({ error: 'An error occurred while deleting the itinerary.' });
    }
  });

export default app;