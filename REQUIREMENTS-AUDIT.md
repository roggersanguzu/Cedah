# CEDAH requirements audit

Scope: the supplied feature tiers, expanded objectives, founding-note transcript, responsive/theme/WhatsApp requests, and the follow-up request for editable images, public publishing, scroll animation and a branded spinner.

## Requirement coverage

| Requirement | Implementation and practical status |
| --- | --- |
| Ten objectives and founding focus | Editable objectives cover market access, up to 500 youth jobs over five years, food security, skills, employment pathways, value addition, responsible production, farmer prosperity, partnership readiness and regional growth. Enterprise and roadmap defaults include grain storage/processing, ranching/feedlots, phased dairy/goats and high-value crop market research. The employment figure is a target. |
| Partner data room | Super admin can upload or link approved PDFs, edit descriptions/version/date, publish, unpublish and delete. Actual approved CEDAH documents still need to be supplied. |
| Impact reporting | Published results have a measurement date and evidence source; targets are separate. No achievement numbers are fabricated. CEDAH must supply verified results. |
| Board, team and partners | Editable profile groups, names, roles, biographies, portraits, links and display order. Real biographies and approved portraits still need to be supplied. |
| Field evidence | Dated photo/video records with location, captions, credits and publication-rights confirmation. Existing stock photography is labelled illustrative. Genuine CEDAH field media still needs to be supplied. |
| Farmer, training and buyer workflows | Dedicated forms with relevant details, consent, validation, error/retry states and persistent intake APIs. Buyer enquiries capture product and quantity; CEDAH confirms orders directly. |
| Partnership CRM/inbox | Contact and registration records feed one protected inbox with filters, status, notes, CSV export and optional Resend notifications. Saved submissions remain available if notification delivery fails. No third-party CRM account is connected. |
| News, projects and roadmap CMS | Create, edit, publish, unpublish and delete. Full news/project text, images, roadmap status and target dates are rendered publicly. |
| Images and deletion | Enterprise, news, project, opportunity, team, site and product images appear in public views. Editors support upload, preview, replacement and removal. Media library supports renaming and guarded deletion; referenced files must first be detached. |
| SEO | Metadata, canonical URLs, organisation structured data, sitemap, robots rules and noindex for administration/unsubscribe. Production site URL remains deployment configuration. |
| Languages | Farmer/training/buyer forms support English, Luganda and Kiswahili, with the selected language saved for follow-up. The whole website is not translated; CEDAH should review translations before local-language promotion. |
| Newsletter | Consent-based registration, inbox/export and personal unsubscribe link. Campaign composition/sending is an operational next step, separate from signup. |
| Market prices | Admin-published observations include crop, market, price, currency, unit, date and source. Older-than-seven-day observations carry a reconfirmation notice. No automatic market feed is claimed. |
| Products and sites | Product catalogue, contextual buyer enquiries, and interactive OpenStreetMap locations from published coordinates. Online payment/checkout is not part of this phase. |
| Super-admin control | Protected CMS and settings for all 13 public resource types, applications, enquiries, media, main homepage copy and public contact information. Credentials and service secrets stay in deployment configuration. |
| Responsive layout and theme | Public pages, forms, dashboard navigation/editors/inbox and sign-in were checked at representative phone, tablet and desktop widths in light/dark mode. Theme preference persists; phone controls remain accessible. |
| WhatsApp | Floating, accessible, safe-area-aware WhatsApp link defaults to +256769758805 and can be changed in admin settings. |
| Spinner and animation | CEDAH sprout-and-orbit loader for route loading, record loading, saves/uploads and public submissions. Scroll reveals and image motion respect reduced-motion settings; public content is visible without JavaScript. |

## Verification evidence

- Production Next.js build passed, including TypeScript compilation. Fonts are served locally with their licences, removing build-time font downloads.
- ESLint and `git diff --check` passed.
- `npm run test:platform`: **24 tests passed**. Coverage includes authentication boundaries, unsafe inputs, publication requirements, consent, storage/notification failures, unsubscribe rules, media reference protection and the complete create/edit/replace-image/unpublish/republish/delete lifecycle for all 13 resource types through the public data getter.
- Production-browser review: **171 layout/interaction observations**, no horizontal-overflow failures or JavaScript runtime exceptions. Widths covered 320, 375, 768 and 1440 pixels in both themes; smaller/large widths also covered sign-in, privacy, terms and unsubscribe. Public form retry/success states and their spinners were exercised.
- Development-browser review repeated all **171 layout/interaction observations** using Webpack, with no horizontal-overflow failures or JavaScript runtime exceptions. Mobile navigation focus, form retries, successful submissions and their spinners passed.
- Fixed inconsistent Turbopack development output: a chunk labelled `globals.css` contained dashboard styles. `npm run dev` now uses Webpack. Eight further browser checks confirmed public/admin styles remain intact when both stylesheets are edited and restored through hot reload, without a full page reload. The normal preview at port 3000 was restarted with the corrected configuration and checked in the browser.
- `npm run check:styles -- http://localhost:3000` passed. This read-only check verifies stylesheet responses and the required public, global, dashboard and loading styles on the homepage and admin login.
- Browser screenshots and raw reports are under `.next-check/`, including enterprise cards, the board editor, inbox, documents, a pending registration spinner and `hmr-audit-results.json`.

API tests use local database/provider mocks. Browser mutation requests are intercepted with synthetic fixtures; they do not write to the live database, upload/delete real Cloudinary assets or send messages. Production MongoDB persistence, Cloudinary delivery and email delivery therefore still require an authorised live-service check before release. These checks cannot establish support for every physical device; they exercise the stated viewport and browser conditions.

See [PLATFORM-GUIDE.md](./PLATFORM-GUIDE.md) for publishing instructions and the required real CEDAH materials.
