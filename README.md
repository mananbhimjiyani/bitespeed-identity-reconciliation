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

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <your-github-repo-url>
   cd bitespeed-identity-reconciliation

Install dependencies:
bash

npm install

Set up environment variables in .env:

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres

Run migrations:
bash

npx prisma migrate dev

Start the server locally:
bash

npm run dev

Endpoint
POST /api/identify
Body: { "email"?: string, "phoneNumber"?: string }

Response:
json

{
  "contact": {
    "primaryContatctId": number,
    "emails": string[],
    "phoneNumbers": string[],
    "secondaryContactIds": number[]
  }
}

Testing
Test the endpoint using curl or Postman:
bash

curl -X POST https://<your-render-url>/api/identify \
-H "Content-Type: application/json" \
-d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}'

---

## Step 6: Submit the Task

1. **Push Final Changes**:
   - Commit any remaining changes and push to GitHub:

     ```bash
     git add .
     git commit -m "Complete identity reconciliation implementation and Render deployment"
     git push origin main
     ```

2. **Submit via Google Form**:
   - Go to the [submission form](https://docs.google.com/forms/d/e/1FAIpQLSdy1k9SPaW5MQYd0TUj4N5K3AqdOK7G1hXTtnYIzCHw438W-g/viewform?usp=dialog).
   - Provide your GitHub repository URL and the hosted endpoint URL (`https://<your-render-url>/api/identify`).

---

## Additional Notes

- **Render Free Tier**: The free tier may spin down after inactivity, causing a slight delay on the first request. For production, consider upgrading to a paid plan.
- **Supabase Connection Limits**: The free Supabase tier has connection limits. If you encounter issues, check the Supabase dashboard for connection usage and consider optimizing Prisma’s connection pool or upgrading the plan.
- **Error Handling**: The provided code includes basic error handling. Enhance it with specific error messages (e.g., for database connection failures) if needed.
- **Testing Locally**: Before deploying, test locally with `npm run dev` and a local PostgreSQL database or Supabase’s connection string.
- **Netlify Alternative**: Netlify is not suitable for this Node.js backend, as it’s designed for static sites or serverless functions. If you need a serverless approach, you could rewrite the `/identify` endpoint as a Netlify Function, but this would require significant changes and is not recommended for this task.

---

This setup provides a complete solution for hosting your Bitespeed Identity Reconciliation service on Render with a Supabase PostgreSQL database. Let me know if you need help with specific parts of the implementation or troubleshooting!

