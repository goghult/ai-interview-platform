import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interviewRoutes.js';
import supabase, { isSupabaseConfigured } from './config/supabase.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.json({ status: 'ok', database: 'not_configured' });
  }

  try {
    const { error } = await supabase
      .from('interviews')
      .select('id', { head: true, count: 'exact' })
      .limit(1);

    if (error) throw error;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Supabase health check failed:', error.message);
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

app.use('/api', interviewRoutes);

export default app;
