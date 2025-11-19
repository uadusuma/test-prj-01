import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import './config/redis'; // Initialize Redis connection

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
import passport from './config/passport';
app.use(passport.initialize());


import authRoutes from './routes/authRoutes';
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
    res.send('Auth Service API');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
