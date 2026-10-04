# CEDAH deployment

## Required production services

1. Create a MongoDB Atlas database and copy its connection string into `MONGODB_URI`.
2. Add the Cloudinary cloud name, API key and API secret.
3. Generate a long random `AUTH_SECRET` and replace the initial administrator password.
4. Add the production site URL and contact email settings.
5. Run `npm run db:setup` once to create MongoDB indexes.
6. Run `npm run db:seed` once to add approved starter content without overwriting future administrator edits.

If the deployment network blocks MongoDB Atlas SRV lookups, set `MONGODB_DNS_SERVERS` to a comma-separated resolver list such as `8.8.8.8,1.1.1.1`.

## Vercel

Import the repository, add every required value from `.env.example` in Project Settings > Environment Variables, and deploy. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain. The health endpoint is `/api/health` and returns a degraded response if MongoDB or Cloudinary cannot be reached.

## Docker

Build with `docker build -t cedah-web .` and run with `docker run --env-file .env.production -p 3000:3000 cedah-web`. The standalone server listens on port 3000. The image copies both `public` and `.next/static` into the standalone runtime.

## Release verification

Run these checks before each deployment:

```bash
npm ci
npm run lint
npm run build
npm run services:verify
```

After starting the built application, run `npm run app:smoke -- https://your-domain.example` from a trusted environment containing the administrator and service variables.

## Production security checklist

- Replace `SUPER_ADMIN_PASSWORD` and `AUTH_SECRET` before going live.
- Restrict the MongoDB Atlas network rules and use a least-privilege database user.
- Keep `CLOUDINARY_API_SECRET`, `MONGODB_URI` and all service keys server-only.
- Configure the production sender domain in Resend before enabling notifications.
- Confirm backups, monitoring, analytics consent and a privacy policy before collecting live enquiries.
