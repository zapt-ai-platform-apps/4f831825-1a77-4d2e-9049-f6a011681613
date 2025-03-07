import { initializeZapt } from '@zapt/zapt-js';
import Sentry from "./_sentry.js";

const APP_ID = process.env.VITE_PUBLIC_APP_ID;
if (!APP_ID) {
  throw new Error('Missing VITE_PUBLIC_APP_ID environment variable');
}
const { customerSupport } = initializeZapt(APP_ID);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    const zaptSecretKey = process.env.ZAPT_SECRET_KEY;
    if (!zaptSecretKey) {
      throw new Error('Missing ZAPT_SECRET_KEY environment variable');
    }
    const supportResponse = await customerSupport(email, zaptSecretKey);
    console.log('Customer support response:', supportResponse);
    return res.status(200).json(supportResponse);
  } catch (error) {
    console.error('Error in customerSupport endpoint:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: error.message });
  }
}