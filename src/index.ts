import express from 'express';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Add health check endpoint
app.get('/api/identify', (_, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Routes
app.use('/api', routes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});