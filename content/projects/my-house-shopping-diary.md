# House Shopping Diary

House Shopping Diary is one of the subject's software projects.
Summary: Still under construction.
Note: App is still under construction

# My house shopping diary

The **House Shopping Record WebApp** is a centralized platform designed to simplify the house-hunting process. Inspired by the challenges I faced during my own house shopping journey, this app helps users keep track of important property details, plan viewing schedules, and organize all house-related information in one place. Unlike traditional property websites like TradeMe, this app includes features tailored to make house shopping more efficient and organized.

## Features

1. **Centralized House Information**:

   - Store all property details in one place.
   - Pull house information automatically from **TradeMe.co.nz** or manually input details.

2. **Key Property Details**:

   - **Potential Sell Price**: Record the estimated sell price provided by agents during visits.
   - **Commute Time**: Track the commute time from the property to your workplace (no more checking maps repeatedly!).
   - **Viewing Schedule**: Plan and group viewing times for efficient weekend planning.
   - **Visited and Favourite Toggle**: Mark properties as visited or favourite for easy filtering.
   - **Comments**: Add notes or comments about each property for future reference.
   - **Editable Fields**: Update any field as needed.

3. **Efficient Planning**:
   - Group viewing times to optimize weekend schedules.
   - Filter properties by visited status, favourites, or other criteria.

## Technologies Used

- **Frontend Framework**: Next.js (with App Router).
- **Database**: PostgreSQL (hosted on **Neon**).
- **ORM**: Drizzle.
- **Authentication**: Clerk.
- **Styling**: shadcn/ui + TailwindCSS.
- **API Layer**: tRPC (for end-to-end type safety).

## Installation

1. Install dependencies:

   `pnpm install`

2. Create a `.env.local` file in the root directory and add the following environment variables:

```shell
### Neon
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
POSTGRES_URL_NO_SSL=
POSTGRES_PRISMA_URL=

### Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

3. Run the development server:

   `pnpm dev`

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Acknowledgments

- Inspired by the challenges of house shopping and the need for better organization.
- t3pps for the idea and initial implementation.
- Built with Next.js, Neon, Drizzle, Clerk, shadcn/ui, TailwindCSS, and tRPC.
