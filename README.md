# Digital Heroes

Digital Heroes is a full-stack web application built with **Next.js**, designed as part of a full-stack development project.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js server-side APIs
- **Database:** Project-configured database
- **Payments:** Stripe
- **Package Manager:** npm

## Features

- Responsive web interface
- User-facing application pages
- Server-side application logic
- Database integration
- Stripe payment integration
- Environment-based configuration
- Production deployment support with Vercel

## Project Structure

```text
digital-heroes/
├── app/                  # Next.js application routes and pages
├── components/           # Reusable UI components
├── lib/                  # Utilities and application logic
├── public/                # Static assets
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── next.config.ts         # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.mjs      # ESLint configuration
├── proxy.ts               # Application proxy configuration
└── .gitignore             # Git ignore rules
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/HarshalEdke/digital-heroes.git
cd digital-heroes
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file:

```text
.env.local
```

Add the environment variables required by the application, such as database, authentication, and Stripe configuration.

**Never commit `.env.local` or secret API keys to GitHub.**

### 4. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

To create a production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm start
```

## Stripe

The application uses Stripe for payment functionality.

For development and testing, use **Stripe test mode** and test API keys. Keep Stripe secret keys in `.env.local` and configure the corresponding environment variables in Vercel for production/deployment environments.

## Deployment

The application can be deployed using **Vercel**.

Typical deployment flow:

1. Push the project to GitHub.
2. Import the GitHub repository into Vercel.
3. Configure the required environment variables.
4. Deploy the application.
5. Configure Stripe webhook endpoints using the deployed Vercel URL.
6. Test the complete payment flow using Stripe test mode.

## Environment Variables

Environment variables depend on the services enabled in the project.

Example:

```text
# Database
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Use the exact variable names required by the application's source code. Do not commit real credentials.

## Development Notes

Generated and sensitive files should remain excluded from Git, including:

```text
node_modules/
.next/
.env
.env.local
.vercel/
*.tsbuildinfo
```

## License

This project is currently intended for educational and development purposes.

---

**Digital Heroes**  
Full-Stack Development Project
