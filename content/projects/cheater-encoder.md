# Cheater Encoder

Cheater Encoder is one of the subject's software projects.
Summary: A Mac OS portfolio website.

## Links
- Github: https://github.com/diao1v/cheater-encoder

The **Cheater Encoder** is a tool designed to help video developers test streaming players by generating mock manifests. Normally, setting up a test stream with specific requirements (e.g., fallover time, video behavior debugging) requires significant effort and coordination with encoder teams. This project empowers video developers to upload video segments to a desired CDN and generate manifests to simulate live, VoD, and Live-to-VoD scenarios. Developers have full control over manifest parameters such as buffer time, DVR window, presentation delay, timescale, presentation time offset, segment start number, and more.

## Features

1. **Supabase Authentication**:
   - Sign up (with invitation code) and sign in.
2. **Manifest Generation**:
   - Default manifest values for quick setup.
   - DASH format manifest.
   - Live stream format manifest.
   - VoD format manifest.
   - Live-to-VoD format manifest with real-time switching option.
3. **Full Control Over Manifest Parameters**:
   - Buffer time, DVR window, presentation delay, timescale, presentation time offset, segment start number, etc.

## Technologies Used

- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Frontend Framework**: Next.js (Page Router)
- **UI Library**: Mantine Component Library
- **Styling**: TailwindCSS

## Installation

1. Install dependencies:

   `yarn install`

2.Set up environment variables:

- Create a `.env.local` file in the root directory.
- Add the following environment variables:

```shell
SUPABASE_URL=
SUPABASE_DATABASE_PASSWORD=
SUPABASE_ANON_KEY=
SUPABASE_SERVER_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

3. Run the development server:

   `yarn dev`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Sign Up and Sign In

- Use an invitation code to sign up (you could preset the invitation code in supabase database).
- Sign in with your credentials to access the dashboard.

### Generate Manifests

1. Upload video segments to your desired CDN(eg. ASW S3).
2. Configure manifest parameters (e.g., buffer time, DVR window, presentation delay).
3. Select the desired manifest format:
   - **Live Stream**
   - **VoD**
   - **Live-to-VoD** (with real-time switching option).
4. Generate and download the manifest.
5. Copy the manifest URL and test it in your streaming player.
