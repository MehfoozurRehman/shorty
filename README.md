# Shorty

A fast and lightweight URL shortener service built with TypeScript, Hono, and Prisma ORM.

## Overview

Shorty provides a clean API for generating short links, tracking total click counts, and redirecting incoming traffic. It also supports CLI queries to inspect target URLs directly without triggering standard browser redirects.

## Tech Stack

- **Runtime & Server**: Node.js & [Hono](https://hono.dev/) (`@hono/node-server`)
- **Database ORM**: [Prisma](https://www.prisma.io/) (MongoDB provider)
- **Language**: TypeScript (`tsx`)

## Prerequisites

- Node.js (v18 or higher recommended)
- A MongoDB database instance
- Package manager (`pnpm` or `npm`)

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory and configure your MongoDB connection:
   ```env
   DATABASE_URL="your-mongodb-connection-string"
   PORT=3000
   ```

3. **Generate Prisma Client**:
   ```bash
   pnpm generate
   # or
   npm run generate
   ```

4. **Run the Development Server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

## Available Scripts

- `pnpm dev` - Starts the development server with live reload (`tsx watch`).
- `pnpm start` - Generates the Prisma client and boots up the server.
- `pnpm studio` - Opens Prisma Studio to view and manage database records visually.
- `pnpm format` - Formats the codebase using Prettier.

## Author

Created by [Mehfooz-ur-Rehman](https://github.com/MehfoozurRehman).
