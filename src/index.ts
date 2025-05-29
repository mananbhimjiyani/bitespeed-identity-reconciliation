// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient(); // Initialize Prisma Client

app.use(express.json()); // Enable JSON body parsing

app.use('/', routes); // Use the defined routes

// Database connection check (optional, but good for health checks)
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Simple query to check DB connection
    res.status(200).send('Database connection successful!');
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).send('Database connection failed!');
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});