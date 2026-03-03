# Media Mapper

An open-source framework for exploring media objects based on their geographical location data. Media Mapper provides a spatially driven way of exploring how topics (i.e. water, the environment, landmarks) are portrayed in media across space and time.

![Made possible through funding provided by the University of Pennsylvania](./public/upenn_logo.png)

## 🌍 Overview

Media Mapper is designed to be a flexible, open-source web application framework that allows anyone to build their own media exploration tool with geospatial data. The application connects to Airtable as a data source and provides an interactive map interface for browsing and exploring media content.

### Key Features

- **Interactive Map**: Browse media locations by zooming, panning, and selecting data points
- **Detailed Media Views**: View additional information about selected points including images and text
- **Shareable URLs**: Each map data point has a unique URL for easy sharing
- **Tabular View**: Browse the entire dataset in a structured table format
- **Accessibility**: Built to conform with WCAG 2.2 Level AA standards
- **Customizable**: Fork and customize for your own datasets

## 🚀 Quick Start

### Prerequisites

- Node.js 20.9.0+
- npm, pnpm, or yarn
- Airtable account with properly structured data
- Mapbox account for map functionality

### Installation

#### Option A: Fork the Repository (Recommended)

Forking allows you to customize Media Mapper while maintaining the ability to receive upstream updates.

1. **Fork the repository**
   - Go to the [Media Mapper GitHub repository](https://github.com/your-org/media-mapper)
   - Click the "Fork" button in the top-right corner
   - Choose your GitHub account or organization as the destination

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/media-mapper.git
   cd media-mapper
   ```

3. **Set up upstream remote** (to receive updates from the original repository)
   ```bash
   git remote add upstream https://github.com/your-org/media-mapper.git
   git remote -v  # Verify you have both 'origin' and 'upstream' remotes
   ```

#### Option B: Direct Clone

If you don't plan to contribute back or customize significantly, you can clone directly:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/media-mapper.git
   cd media-mapper
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Copy the example environment file and configure your API keys:

   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` with your actual values:

   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   AIRTABLE_API_KEY=your_airtable_api_key
   AIRTABLE_BASE_ID=your_airtable_base_id
   AIRTABLE_VIEW_NAME=your_airtable_view_name
   ENABLE_ANALYTICS=false
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see your Media Mapper instance.

## 📋 Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Run TypeScript type checking
npm run type-check
```

## 🗂️ Project Structure

```
media-mapper/
├── app/                    # Next.js App Router pages and layouts
│   ├── data.ts            # Airtable data fetching logic
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage with map interface
│   └── table/             # Table view page
├── components/            # React components
│   ├── map.tsx           # Interactive map component
│   ├── location-details.tsx
│   ├── media-locations-table/
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   ├── airtable/         # Airtable integration
│   │   ├── index.ts      # Airtable client configuration
│   │   └── types.ts      # TypeScript interfaces
│   └── utils.ts          # Tailwind utility functions
├── public/               # Static assets
└── CLAUDE.md            # Development instructions for Claude Code
```

## 🗄️ Data Source Configuration

Media Mapper uses Airtable as its primary data source. Your Airtable base must follow a specific schema for the application to work correctly.

### Mapbox Account Setup

#### 1. Create a Mapbox Account

- Sign up for a free account at [mapbox.com](https://mapbox.com)
- Mapbox provides generous free usage limits (up to 50,000 map loads per month)

#### 2. Get Your Access Token

1. After signing up, navigate to your [Mapbox Account Dashboard](https://console.mapbox.com/account/access-tokens/)
2. Go to the **Access tokens** section
3. Copy your **Default public token** (starts with `pk.`)
4. Alternatively, create a new public token:
   - Click **Create a token**
   - Give it a descriptive name (e.g., "Media Mapper Production")
   - Select the **Public scopes** (the defaults are sufficient)
   - Click **Create token**

#### 3. Configure Token Restrictions (Optional but Recommended)

For production deployments, restrict your token usage:

1. Click on your token in the dashboard
2. Add **URL restrictions** to limit usage to your domains
3. Example restrictions:
   - `http://localhost:3000/*` (for local development)
   - `https://yourdomain.com/*` (for production)

#### 4. Add to Environment Variables

Add your Mapbox token to your `.env.local` file:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

**Important**: The token must be prefixed with `NEXT_PUBLIC_` to be available in the browser for map rendering.

### Required Airtable Setup

#### 1. API Access

- Create an Airtable account at [airtable.com](https://airtable.com)
- Generate a personal access token from your [Airtable account settings](https://airtable.com/account) with the scopes `data.records:read`
- Note your Base ID from your Airtable base URL - it will be the first path parameter (i.e. https://airtable.com/[BASE_ID]?)

#### 2. Base Structure

Your Airtable base should contain the following tables:

##### Media Locations Table

A table named **"Media Locations"** with the following fields:

##### Required Fields:

- **Name** (Single line text) - Primary field, name of the location/media
- **Latitude** (Number) - Geographic latitude coordinate
- **Longitude** (Number) - Geographic longitude coordinate

##### Optional Location Fields:

- **Location Name** (Single line text) - Descriptive name of the location
- **Location Description** (Long text) - Detailed description of the location
- **Natural Feature Name** (Single line text) - Name of natural features (rivers, mountains, etc.)
- **City** (Single line text) - City name
- **Region** (Single line text) - State/Province/Region
- **Country** (Single line text) - Country name

##### Linked Media Fields (from related Media table):

- **Name (from Media)** - Linked record field to Media table
- **Original Title (from Media)** - Lookup field
- **Director (from Media)** - Lookup field
- **Release Year (from Media)** - Lookup field
- **Description (from Media)** - Lookup field
- **Image (from Media)** - Lookup field (Attachment)
- **Video (from Media)** - Lookup field (Attachment)
- **Video Link (from Media)** - Lookup field (URL)
- **Subjects (from Media)** - Lookup field (Multiple select)
- **Language (from Media)** - Lookup field (Multiple select)
- **References (from Media)** - Lookup field (Long text)
- **Rights (from Media)** - Lookup field (Single line text)
- **Rights Statement Link (from Media)** - Lookup field (URL)
- **Media Type (from Media)** - Lookup field (Single select)

##### Web App Metadata Table

A table named **"Web App Metadata"** with the following fields to customize your site's metadata and branding:

**Required Fields:**
- **Site Title** (Single line text) - The title that appears in the browser tab and navigation
- **Site Description** (Long text) - Meta description for SEO and site previews
- **Site Keywords** (Multiple select or Single line text) - Keywords for SEO optimization
- **Creator** (Single line text) - Attribution information for site creators
- **Owner** (Single line text) - Organization or individual who owns/operates the site

**Usage:**
- The application reads the first record from this table to populate site metadata
- This data is used for:
  - Browser page titles and meta descriptions
  - Navigation bar title
  - Footer attribution
  - Social media preview information
  - Search engine optimization

**Example Record:**
```
Site Title: "Water Stories Map"
Site Description: "Explore how water is portrayed in media across different locations and time periods through our interactive mapping platform."
Site Keywords: ["water", "media", "geography", "storytelling", "environmental"]
Creator: "Dr. Jane Smith, University Research Team"
Owner: "Environmental Media Research Lab"
```

**Important Notes:**
- Only the first record in this table is used by the application
- If this table is missing or empty, the application falls back to default metadata
- Changes to this table require a new deployment to take effect in production

#### 3. Views and Permissions

- Create a view in your "Media Locations" table that includes all records you want to display
- Ensure your Airtable base is shared with appropriate permissions for your API key
- Set the view name in your `AIRTABLE_VIEW_NAME` environment variable

### Data Schema Types

The application expects the following TypeScript interfaces (defined in `lib/airtable/types.ts`):

```typescript
interface MediaLocation {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  location_name?: string;
  location_description?: string;
  natural_feature_name?: string;
  city?: string;
  region?: string;
  country?: string;
  media?: Media;
}

interface Media {
  name: string;
  original_title?: string;
  media_type?: string;
  director?: string;
  release_year?: number;
  description?: string;
  image?: MediaImage;
  video?: string;
  video_link?: string;
  subjects?: string[];
  language?: string[];
  references?: string;
  rights?: string;
  rights_statement_link?: string;
}

interface WebAppMetadata {
  title?: string;
  description?: string;
  keywords?: string | string[];
  creator?: string;
  owner?: string;
}
```

## 🎨 Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Maps**: [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- **Data Source**: [Airtable](https://airtable.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) (optional)

## 🔧 Configuration Options

### Environment Variables

| Variable                   | Required | Description                                      |
| -------------------------- | -------- | ------------------------------------------------ |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes      | Mapbox public access token for map functionality |
| `AIRTABLE_API_KEY`         | Yes      | Airtable personal access token                   |
| `AIRTABLE_BASE_ID`         | Yes      | Your Airtable base identifier                    |
| `AIRTABLE_VIEW_NAME`       | Yes      | The view name in your Media Locations table      |
| `ENABLE_ANALYTICS`         | No       | Set to `true` to enable Vercel Analytics         |

### Customization

The application is designed to be easily customizable:

1. **Styling**: Modify `app/globals.css` and Tailwind configuration
2. **Components**: Customize components in the `components/` directory
3. **Data Structure**: Adapt `lib/airtable/types.ts` for your data schema
4. **Map Settings**: Configure map style and behavior in `components/map.tsx`

## 🚀 Deployment

### Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications with automatic builds and deployments.

#### Initial Deployment

1. **Prepare Your Repository**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**

   - Sign up at [vercel.com](https://vercel.com) using your GitHub account
   - Click "New Project" and import your Media Mapper repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Environment Variables**

   In your Vercel project dashboard:

   - Go to **Settings** → **Environment Variables**
   - Add each required variable:

   | Variable                   | Value                   | Environment                      |
   | -------------------------- | ----------------------- | -------------------------------- |
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | `pk.your_mapbox_token`  | Production, Preview, Development |
   | `AIRTABLE_API_KEY`         | `your_airtable_api_key` | Production, Preview, Development |
   | `AIRTABLE_BASE_ID`         | `your_airtable_base_id` | Production, Preview, Development |
   | `AIRTABLE_VIEW_NAME`       | `your_view_name`        | Production, Preview, Development |
   | `ENABLE_ANALYTICS`         | `true`                  | Production                       |

   **Important**: Select all three environments (Production, Preview, Development) for each variable unless specified otherwise.

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Your application will be available at `https://your-project-name.vercel.app`

#### Deploying Updates

**Automatic Deployment:**

- Every push to your `main` branch automatically triggers a new deployment
- Preview deployments are created for pull requests

**Manual Deployment:**

1. Make your changes locally
2. Test thoroughly with `npm run build` and `npm run lint`
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat: your update description"
   git push origin main
   ```
4. Vercel automatically builds and deploys within 1-2 minutes

**Environment Variable Updates:**

- Changes to environment variables require a new deployment
- After updating variables in Vercel dashboard, trigger a redeploy:
  - Go to **Deployments** tab in Vercel
  - Click the three dots (⋯) on the latest deployment
  - Select "Redeploy"

#### Custom Domain Setup

1. **Add Domain in Vercel**

   - Go to **Settings** → **Domains**
   - Add your custom domain (e.g., `yourdomain.com`)

2. **Update DNS Records**

   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or follow Vercel's specific DNS instructions

3. **Update Mapbox Token Restrictions**
   - Add your custom domain to your Mapbox token URL restrictions
   - Include both `https://yourdomain.com/*` and `https://*.yourdomain.com/*`

### Other Platforms

Media Mapper can be deployed to any platform that supports Next.js applications:

#### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Install the Next.js plugin: `@netlify/plugin-nextjs`
5. Configure environment variables in Netlify dashboard

### Pre-Deployment Checklist

Before deploying to production:

- [ ] Test the build locally: `npm run build`
- [ ] Run linting: `npm run lint`
- [ ] Verify all environment variables are set correctly
- [ ] Test with production data in your Airtable base
- [ ] Ensure Mapbox token has appropriate URL restrictions
- [ ] Confirm Airtable base permissions allow API access
- [ ] Test the application functionality end-to-end

## 🍴 Working with Your Fork

If you forked the repository, here's how to keep it updated and manage your customizations:

### Keeping Your Fork Updated

You can sync your fork with the original repository using either the GitHub UI or command line.

#### Option A: GitHub UI (Easiest)

1. **Navigate to your fork** on GitHub (https://github.com/YOUR_USERNAME/media-mapper)
2. **Check for updates**: You'll see a message like "This branch is X commits behind original-repo:main" if updates are available
3. **Sync fork**: Click the **"Sync fork"** button
4. **Confirm**: Click **"Update branch"** to pull in the latest changes from the original repository
5. **Pull locally** (if you're working on the project locally):
   ```bash
   git pull origin main
   ```

#### Option B: Command Line

1. **Fetch upstream changes**
   ```bash
   git fetch upstream
   ```

2. **Switch to your main branch and merge updates**
   ```bash
   git checkout main
   git merge upstream/main
   ```

3. **Push updates to your fork**
   ```bash
   git push origin main
   ```

### Managing Customizations

**Recommended Workflow:**
1. Keep your `main` branch clean and up-to-date with upstream
2. Create separate branches for your customizations:
   ```bash
   git checkout -b custom/my-theme
   git checkout -b custom/my-data-fields
   ```
3. Deploy from your custom branches or merge them into a `production` branch

**Example Custom Branch Workflow:**
```bash
# Create and work on a custom feature
git checkout -b custom/branded-theme
# Make your changes...
git add .
git commit -m "feat: add custom branding and theme"
git push origin custom/branded-theme

# Deploy this branch to production
# (Configure your deployment platform to use this branch)
```

### Handling Merge Conflicts

When updating from upstream, you might encounter conflicts:

1. **Resolve conflicts manually** in your editor
2. **Test thoroughly** after resolving conflicts
3. **Commit the resolution**:
   ```bash
   git add .
   git commit -m "resolve: merge conflicts with upstream updates"
   ```

## 🤝 Contributing

We welcome contributions! This project is open source and designed to be a community resource.

### Getting Started

1. Fork the repository (see [Working with Your Fork](#-working-with-your-fork) above)
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`, `npm run type-check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request against the original repository

### Development Guidelines

- Follow the existing code style and patterns
- Ensure accessibility standards are maintained
- Test your changes thoroughly
- Update documentation as needed
- Keep commits focused and write clear commit messages

### Types of Contributions

We especially welcome:

- **Bug fixes** - Help make Media Mapper more stable
- **Accessibility improvements** - Ensure WCAG 2.2 AA compliance
- **Documentation** - Improve setup guides and API docs
- **New features** - Enhance the core mapping and data visualization capabilities
- **Performance optimizations** - Make the app faster and more efficient
- **Testing** - Add unit tests, integration tests, and accessibility tests

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- **Documentation**: Check this README and `CLAUDE.md` for development guidance
- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/your-org/media-mapper/issues)
- **Community**: Join our discussions for questions and ideas

## 🙏 Acknowledgments

Made possible through funding provided by the University of Pennsylvania.

---

**Ready to explore media through space and time?** 🗺️✨
