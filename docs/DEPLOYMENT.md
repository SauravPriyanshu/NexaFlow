# Required GitHub Secrets
# Go to repo → Settings → Secrets → Actions → New secret

RENDER_DEPLOY_HOOK_URL    # Render → Service → Settings → Deploy Hook URL
VERCEL_TOKEN              # vercel.com → Account Settings → Tokens
VERCEL_ORG_ID             # vercel.com → team settings → general
VERCEL_PROJECT_ID         # .vercel/project.json after running vercel link

# Required Render Environment Variables
# Set in Render dashboard → Service → Environment

NODE_ENV=production
MONGODB_URI=
REDIS_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=https://nexaflow.vercel.app
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@nexaflow.dev
