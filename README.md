# Clarity Feed

```markdown
# Clarity Feed

AI-powered customer feedback analysis platform that transforms raw feedback into actionable insights using Claude AI.

## Overview

Clarity Feed helps businesses analyze customer feedback at scale. Upload feedback via CSV or manual entry, and get instant AI-powered sentiment analysis, category classification, theme extraction, and urgency detection.

## Features

### Core Functionality
- **Multi-source Feedback Collection** - Upload CSV files or add feedback manually
- **AI-Powered Analysis** - Powered by Anthropic's Claude 4 for accurate sentiment and intent detection
- **Sentiment Analysis** - Automatic classification (positive, negative, neutral, mixed) with confidence scores
- **Category Classification** - Organizes feedback into product, service, pricing, support, delivery categories
- **Theme Extraction** - Identifies recurring topics across feedback
- **Urgency Detection** - Flags critical issues requiring immediate attention
- **Batch Processing** - Analyze hundreds of feedback items simultaneously

### Analytics & Insights
- **Interactive Dashboards** - Visual sentiment distribution, category breakdown, top themes
- **Executive Summaries** - AI-generated comprehensive reports with actionable recommendations
- **Urgent Issues Tracking** - Dedicated view for critical and high-priority items
- **Key Insights** - Automated identification of patterns and trends

### User Experience
- **Project Management** - Organize feedback into separate projects
- **Real-time Processing** - Live feedback analysis with progress tracking
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Secure Authentication** - JWT-based auth with bcrypt password hashing

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **Anthropic Claude API** - AI analysis engine
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Infrastructure
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Neon** - Managed PostgreSQL database

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   React     │─────▶│   Express   │─────▶│  PostgreSQL  │
│  Frontend   │      │   Backend   │      │   Database   │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Claude AI  │
                     │     API     │
                     └─────────────┘
```

## Database Schema

```sql
users
├── id (PK)
├── email (unique)
├── password_hash
└── first_name, last_name

projects
├── id (PK)
├── user_id (FK)
└── name, description

feedback
├── id (PK)
├── project_id (FK)
├── original_text
└── customer_name, customer_email, source

analysis
├── id (PK)
├── feedback_id (FK)
├── sentiment, sentiment_score
├── category, themes[]
└── urgency, key_points[], reasoning
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- Anthropic API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/feedbackpulse.git
cd feedbackpulse
```

2. **Setup Backend**
```bash
cd server
npm install
```

Create `server/.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/feedbackpulse
JWT_SECRET=your_secret_key_min_32_characters
ANTHROPIC_API_KEY=sk-ant-your-api-key
PORT=5000
NODE_ENV=development
```

Run database migrations:
```bash
psql -d feedbackpulse -f setup/schema.sql
```

Start backend:
```bash
npm run dev
```

3. **Setup Frontend**
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Visit `http://localhost:5173`

## Deployment

### Database (Neon)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Run schema.sql in SQL Editor
4. Copy connection string

### Backend (Render)
1. Create account at [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy

### Frontend (Vercel)
1. Create account at [vercel.com](https://vercel.com)
2. Import project from GitHub
3. Configure:
   - Root Directory: `client`
   - Framework: Vite
   - Build Command: `npm run build`
4. Add environment variable: `VITE_API_URL`
5. Deploy

## API Documentation

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/stats` - Get project statistics

### Feedback
- `GET /api/projects/:id/feedback` - List feedback
- `POST /api/projects/:id/feedback` - Add feedback
- `POST /api/projects/:id/feedback/upload` - Upload CSV
- `DELETE /api/projects/:id/feedback/:feedbackId` - Delete feedback

### Analysis
- `POST /api/projects/:id/feedback/:feedbackId/analyze` - Analyze single
- `POST /api/projects/:id/analyze` - Batch analyze
- `GET /api/projects/:id/analyses` - Get all analyses
- `POST /api/projects/:id/summary` - Generate executive summary

## Usage

1. **Register/Login** - Create an account or sign in
2. **Create Project** - Set up a new feedback project
3. **Add Feedback** - Upload CSV or add manually
4. **Analyze** - Click "Analyze All" to process feedback
5. **View Analytics** - Explore insights, charts, and executive summary
6. **Monitor Urgent Issues** - Address critical feedback immediately

## CSV Upload Format

```csv
feedback,customer_name,customer_email,date_received,source
"Product is great but shipping was slow",John Doe,john@email.com,2024-01-15,email
"Love the new features!",Jane Smith,jane@email.com,2024-01-16,survey
```

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 chars)
- `ANTHROPIC_API_KEY` - Claude API key
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins

### Frontend
- `VITE_API_URL` - Backend API URL

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/) - AI analysis engine
- [Vercel](https://vercel.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting
- [Neon](https://neon.tech/) - PostgreSQL database

## Support

For issues or questions:
- Open an issue on GitHub
- Email: support@feedbackpulse.com

## Roadmap

- [ ] Export analytics reports as PDF
- [ ] Slack/Teams integrations
- [ ] Multi-language support
- [ ] Custom AI analysis prompts
- [ ] Feedback response templates
- [ ] Team collaboration features
- [ ] API webhooks

---

**Built with ❤️ using React, Node.js, and Claude AI**
```

---

## Add a Simple License File

Create `LICENSE`:

```
MIT License

Copyright (c) 2024 FeedbackPulse

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Deploy

```bash
git add README.md LICENSE
git commit -m "docs: add comprehensive README and license"
git push origin main
```

This README provides everything needed for someone to understand, set up, and deploy your project. You can customize it further with screenshots, demo links, or additional sections as needed.
