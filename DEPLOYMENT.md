# CEDAH deployment

## Required production services

1. Create a MongoDB Atlas database and copy its connection string into `MONGODB_URI`.
2. Add the Cloudinary cloud name, API key and API secret.
3. Generate a long random `AUTH_SECRET` and replace the initial administrator password.
4. Add the production site URL and contact email settings.
5. Run `npm run db:setup` once to create MongoDB indexes.

## Vercel

Import the repository, add every required value from `.env.example` in Project Settings → Environment Variables, and deploy. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain. The health endpoint is `/api/health`.

## Docker

Build with `docker build -t cedah-web .` and run with the production environment variables. The standalone server listens on port 3000.

## Production security checklist

- Replace `SUPER_ADMIN_PASSWORD` and `AUTH_SECRET` before going live.
- Restrict the MongoDB Atlas network rules and use a least-privilege database user.
- Keep `CLOUDINARY_API_SECRET`, `MONGODB_URI` and all service keys server-only.
- Configure the production sender domain in Resend before enabling notifications.
- Confirm backups, monitoring, analytics consent and a privacy policy before collecting live enquiries.
