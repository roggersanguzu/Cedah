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
```

The public website is available at `http://localhost:3000`. Administrator sign-in is at `/admin/login`.

## Verification

```bash
npm run lint
npm run build
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel, Docker and production-security instructions.
