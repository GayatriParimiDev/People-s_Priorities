import dotenv from 'dotenv';
dotenv.config();

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
