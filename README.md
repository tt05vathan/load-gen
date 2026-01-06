# 💕 Birthday Wishes App

A romantic, interactive birthday wishes app with beautiful animations and secure image storage.

## ✨ Features

- 🎂 Beautiful welcome page with animated hearts
- 💌 Individual pages for messages and photos
- 🎬 Smooth slide animations between pages
- 📱 Responsive design (works on mobile)
- 🔒 Secure image storage and validation
- ☁️ Cloud database with Vercel KV
- 🚀 Easy deployment to Vercel

## 🛡️ Security Features

- **Image Validation**: File type and magic number verification
- **Size Limits**: 2MB max per image for optimal performance
- **Compression**: Automatic image compression
- **Secure Storage**: Images stored as Base64 in encrypted database
- **CORS Protection**: Proper API security headers

## 🚀 Deployment to Vercel

### Prerequisites
1. [Vercel Account](https://vercel.com)
2. [Vercel KV Database](https://vercel.com/docs/storage/vercel-kv)

### Steps

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Setup Vercel KV Database**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new KV database
   - Copy the connection details

3. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

4. **Configure Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add environment variables:
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`

### Local Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

## 🎯 Usage

1. **Welcome Page**: Click "Start Your Journey"
2. **Add Content**: Write messages and upload photos
3. **Navigate**: Use ← → arrow keys to move between pages
4. **Auto-Save**: Everything saves automatically

## 🔒 Privacy & Security

- **Images**: Stored securely as Base64 in encrypted database
- **Data**: All content is private to your deployment
- **Validation**: Multiple layers of security checks
- **Performance**: Images compressed for optimal loading

## 💝 Perfect for

- Birthday surprises
- Anniversary messages
- Love letters
- Memory collections
- Special occasions

## 🛠️ Tech Stack

- **Frontend**: React 18, CSS3 Animations
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel
- **Security**: File validation, compression, encryption

---

Made with 💕 for special moments