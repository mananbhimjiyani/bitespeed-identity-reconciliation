# Bitespeed Identity Reconciliation

This is a Node.js/TypeScript application for Bitespeed's Identity Reconciliation task. It consolidates customer contact information from FluxKart.com orders, linking multiple contacts with shared email or phone numbers.

## Deployment

- **Hosted URL**: `https://<your-render-url>/api/identify`
- **Database**: Supabase (PostgreSQL)
- **Hosting Platform**: Render
- **Repository**: [Link to your GitHub repository]

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

