import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.middleware';
import quickTransactionsRoutes from './modules/quickTransactions/quickTransactions.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import firebaseAuthRoutes from './modules/auth/auth.routes';
import portfolioRoutes from './modules/portfolio/portfolio.routes';
import { env } from './config/env';

const app: Application = express();

// CORS Configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (only in development)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
// ÖNEMLİ: Daha spesifik route'lar önce tanımlanmalı
app.use('/api/transactions/quick-transaction', quickTransactionsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/transactions', transactionRoutes);
app.use('/auth', firebaseAuthRoutes);
app.use('/api', firebaseAuthRoutes); // /api/register-profile için

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: env.NODE_ENV 
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;

