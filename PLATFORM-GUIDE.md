# CEDAH platform guide

## Public website

- Ten founding and expanded objectives, including a clearly labelled ambition of up to 500 youth jobs within five years.
- Published enterprise descriptions, projects, full news articles and a phased growth roadmap.
- A partner data room for approved downloadable files; Board of Governors, leadership and partner profiles; dated field photographs and video links.
- Impact results with measurement dates and sources, separate from targets. Missing results are shown as not yet reported.
- Farmer, training and buyer interest forms in English, Luganda and Kiswahili. Form submissions go to the administrator inbox. These are expressions of interest, not guaranteed purchases, places or jobs.
- Newsletter registration with consent and a personal unsubscribe link. Signup stores subscribers; sending newsletter campaigns is a separate operational workflow.
- Dated market price observations, product catalogue and buyer enquiries, and an interactive map of published site coordinates. The catalogue does not take payments or confirm orders automatically.
- Persistent light/dark theme, mobile navigation, phone-friendly dashboard controls, and a floating WhatsApp link to **+256769758805**.
- A CEDAH grain-sprout loader during route loading, dashboard requests and form submission, plus scroll reveals and gentle image motion. Animations respect reduced-motion preferences; content remains available without JavaScript.

## Super administrator

Sign in at `/admin/login`. On a phone, use **Administration section** to access every dashboard section.

1. **Website content** edits the homepage introduction, main image, about text, mission and vision. **Settings** controls the public organisation name, email, phone, location and WhatsApp number. Deployment credentials remain in server configuration.
2. Each resource editor supports creating, editing, publishing, unpublishing and deleting records. Display order controls ordering. Renaming a record keeps its identifier. Deleting or unpublishing managed objectives and roadmap entries does not bring back starter records.
3. In **Board, team & partners**, choose **board**, enter the governor's name, role and biography, add an approved portrait, and publish. Leadership and partner profiles use the same editor.
4. In **Partner data room**, upload an approved PDF or paste a hosted file URL, add its title, description, version and date, and publish. Downloads are public: only publish documents cleared for public access.
5. In **Impact metrics**, choose **actual** or **target**. Actual results require a measurement date and source before publication. In **Field evidence**, add genuine media, the capture date and credit, and confirm publication rights.
6. In **Enquiries & applications**, filter by submission type or status, review registration details, add private follow-up notes, and export the filtered records. A database receipt is the source of truth; email notification failures do not discard submissions. Newsletter unsubscribe status cannot be reversed without fresh consent.
7. **Market prices**, **Product catalogue** and **Operating sites** control the corresponding public sections. A price observation older than seven days is labelled for reconfirmation. Only sites with valid coordinates appear on the map.
8. Image editors support uploading, previewing, replacing and removing images. **Media library** also supports renaming and deleting unused files. Files referenced by a record or website section must be detached before deletion. Enterprise photos and editable highlights appear directly in their public cards.

## Content and service requirements

Real governors' biographies and portraits, approved partner PDFs, original field media, verified results, market observations, products and site coordinates must be supplied and approved by CEDAH. The website does not invent them. Existing illustrative photographs are labelled accordingly. Farmer-facing translations should be reviewed by CEDAH's local-language team before promotion.

MongoDB persists content and submissions. Cloudinary handles uploads; existing hosted URLs can also be used. Resend optionally notifies the configured inbox. Production credentials are described in `.env.example` and `DEPLOYMENT.md`; they are never edited from the public website.

For an authorised fresh database setup, run `npm run db:setup` followed by `npm run db:seed`. Both commands write to the configured database. The starter seed uses insert-only updates and does not overwrite administrator content. Do not reseed deleted starter records unless that restoration is intended.

## Development checks

`npm run lint`, `npm run test:platform` and `npm run build` check the application. Platform tests use local mocks and do not contact MongoDB, send emails or upload assets. The existing `app:smoke` script uses configured services and may send a notification; it should be run only against an intended test environment.

The fonts are bundled locally with their SIL Open Font Licenses under `src/app/fonts`, so production builds do not need to download Google Fonts. `CEDAH_BUILD_DIR` allows an isolated output directory for checks while another developer server is running.
