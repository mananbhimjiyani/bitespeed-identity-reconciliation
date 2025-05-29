import { Request, Response } from 'express';
import { identifyContact } from '../services/contactService';

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'At least one of email or phoneNumber is required' });
    }
    const result = await identifyContact({ email, phoneNumber: phoneNumber?.toString() });
    return res.status(200).json({ contact: result });
  } catch (error) {
    console.error('Error in identify:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};