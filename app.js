import dotenv from 'dotenv';
import express from 'express';
import { sequelize } from './config/database.js';
import urlRoutes from './routes/urlRoutes.route.js';

dotenv.config();

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/', urlRoutes);

app.all('/{*path}', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong'
    });
  }
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully');
      
      await sequelize.sync({ alter: true });
      console.log('Database synced successfully');
      
      const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });

      process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully');
        server.close(() => {
          console.log('Process terminated');
        });
      });

      process.on('SIGINT', () => {
        console.log('SIGINT received. Shutting down gracefully');
        server.close(() => {
          console.log('Process terminated');
        });
      });

    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  };

  startServer();
}

export default app;