# Bitespeed Backend Task: Identity Reconciliation

This is an implementation of the Bitespeed Identity Reconciliation task. The service helps in identifying and tracking customer identities across multiple purchases by linking their contact information.

## Live API Endpoint

The API is live at:
```
https://magenta-sprinkles-d8112a.netlify.app/api/identify
```

## API Usage

Make a POST request to `/api/identify` with a JSON body:

```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

Example Response:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

## Technology Stack

- **Backend Framework**: Node.js with TypeScript
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma
- **Hosting**: Netlify

## Local Development

1. Clone the repository
```bash
git clone https://github.com/mananbhimjiyani/bitespeed-identity-reconciliation.git
cd bitespeed-identity-reconciliation
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with:
```
DATABASE_URL="your-database-url"
PORT=3000
```

4. Run database migrations
```bash
npx prisma migrate deploy
```

5. Start the development server
```bash
npm run dev
```

## Project Structure

```
├── netlify/
│   └── functions/        # Serverless functions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/       # Business logic
│   └── types/         # TypeScript type definitions
└── package.json
```

## Contact Model

The service uses a Contact model with the following structure:

```typescript
{
  id: number;              // Auto-incrementing primary key
  phoneNumber?: string;    // Optional phone number
  email?: string;         // Optional email
  linkedId?: number;      // ID of the primary contact
  linkPrecedence: "primary" | "secondary";  // Contact type
  createdAt: Date;       // Creation timestamp
  updatedAt: Date;       // Last update timestamp
  deletedAt?: Date;      // Soft delete timestamp
}
```