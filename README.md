# CampusXCompany

CampusXCompany connects colleges, companies, and students through verified
opportunities, employer discovery, and campus hiring workflows.

## Development

Install dependencies and start the Next.js development server:

```bash
npm install
npm run dev
```

The application is served at `http://localhost:3000`.

## Production

```bash
npm run build
npm start
```

## Application structure

The project uses the Next.js App Router under [`src/app`](./src/app). The
existing interactive dashboards and local-storage data modules are reused from
the `src/legacy-pages`, `src/components`, and `src/Data` directories. Routes
include:

- `/` — landing page
- `/login` and `/register` — account access
- `/college`, `/college/companies`, and `/college/college-profile` — college workspace
- `/opportunities` — opportunity discovery
- `/company` and `/company/opportunities/new` — company workspace
- `/admin` — administration workspace

Run linting with:

```bash
npm run lint
```
