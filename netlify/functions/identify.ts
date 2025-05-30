import { Handler } from '@netlify/functions'
import { identifyContact } from '../../src/services/contactService'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { email, phoneNumber } = JSON.parse(event.body || '{}')
    
    if (!email && !phoneNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'At least one of email or phoneNumber is required' }),
      }
    }

    const result = await identifyContact({ email, phoneNumber: phoneNumber?.toString() })
    
    return {
      statusCode: 200,
      body: JSON.stringify({ contact: result }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    console.error('Error in identify:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
