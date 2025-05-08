import express from 'express';
import authRoutes from './routes/auth.js';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './db.js';
connectDB();

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
