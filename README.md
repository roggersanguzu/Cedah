# CEDAH Web Platform

Production website and content-management platform for Capital Economic Development Alliance Holdings Ltd.

## Platform capabilities

- Public agribusiness website focused initially on crop and beef enterprises
- Investment, partnership, sustainability, impact and project information
- Authenticated super-administrator command centre
- MongoDB-backed content, projects, news, opportunities, team profiles, metrics and enquiries
- Cloudinary uploads with every public asset URL and metadata stored in MongoDB
- Resend-ready enquiry notifications
- Responsive motion system, SEO metadata, structured data, sitemap, PWA manifest and health checks

## Local development

```bash
npm install
npm run dev
```

Copy the required values from `.env.example` into `.env.local`. After adding the MongoDB connection string, run:

```bash
npm run db:setup
npm run db:seed
npm run services:verify
```

`db:seed` inserts the approved starter content only when a record does not already exist. It does not overwrite content published later through the dashboard.

The public website is available at `http://localhost:3000`. Administrator sign-in is at `/admin/login`.

## Verification

```bash
npm run lint
npm run build
npm run services:verify
npm run security:check
```

For an end-to-end runtime check, start the production server and run `npm run app:smoke -- http://localhost:3000` in a second terminal. The smoke test checks service health, authentication, protected admin data and temporary contact storage cleanup.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel, Docker and production-security instructions.
