# Registration Form

A full-stack registration form built with Next.js, Drizzle ORM, Neon Postgres, and Cloudinary.

**Live Demo:** https://registration-form-seven-lyart.vercel.app/

## Features

- Multi-field registration form with client and server-side validation
- Dependent country → city dropdown
- Photo upload (JPG/PNG, max 1 MB) stored on Cloudinary
- Form data saved to Neon Serverless Postgres via Drizzle ORM
- Thank You confirmation page on successful submission

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Database | Neon Serverless Postgres |
| ORM | Drizzle ORM |
| File Storage | Cloudinary |
| Deployment | Vercel |

## Getting Started

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with the following variables:

```env
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the form.

## Developer

**Syeda Urooj Fatima** — AI Engineer & Full-Stack Developer
GitHub: [github.com/codewithurooj](https://github.com/codewithurooj)
