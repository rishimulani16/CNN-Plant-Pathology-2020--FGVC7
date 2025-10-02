# Apple Leaf Disease Detection

A full-stack web application that uses AI to detect diseases in apple leaves. Built with Next.js frontend and Flask backend, powered by a MobileNetV2 deep learning model.

## Features

- **AI-Powered Detection**: Identifies healthy leaves, apple scab, cedar apple rust, and multiple diseases
- **User Authentication**: Secure signup/login with JWT tokens
- **Image Upload**: Drag & drop interface with image preview
- **Real-time Analysis**: Instant disease detection with confidence scores
- **Responsive Design**: Works on desktop and mobile devices
- **Professional UI**: Clean, agricultural-themed interface
- **Robust Error Handling**: Clear error messages and retry functionality
- **Development Mode**: Mock API for frontend development without backend setup

## Tech Stack

... existing code ...

## Quick Start

### Option 1: Frontend Only (Mock API Mode)
Perfect for testing the UI without setting up the backend:

\`\`\`bash
# Clone and setup
git clone <your-repo-url>
cd apple-leaf-detection
npm install

# Start in mock mode (no NEXT_PUBLIC_API_URL needed)
npm run dev
\`\`\`

**Demo Credentials for Mock Mode:**
- Email: `demo@example.com`
- Password: `demo123`

The app will automatically use mock data for authentication and predictions.

### Option 2: Full Stack Setup

... existing code ...

## Development Modes

### Mock API Mode (Recommended for Frontend Development)
When `NEXT_PUBLIC_API_URL` is not set, the app automatically uses mock APIs:
- **Authentication**: Use `demo@example.com` / `demo123` to login
- **Predictions**: Returns random mock disease predictions
- **No Backend Required**: Perfect for UI development and testing

### Production Mode
Set `NEXT_PUBLIC_API_URL=http://localhost:5000` to connect to the real Flask backend.

## Troubleshooting

### "Server returned non-JSON response" Error

This is the most common error and occurs when the frontend expects JSON but receives HTML. Here's how to fix it:

#### **Solution 1: Use Mock API Mode (Easiest)**
1. Remove or comment out `NEXT_PUBLIC_API_URL` from your `.env.local` file
2. Restart the development server: `npm run dev`
3. Use demo credentials: `demo@example.com` / `demo123`

#### **Solution 2: Setup Backend Properly**
1. **Ensure Backend is Running**:
   \`\`\`bash
   cd backend
   python app.py
   \`\`\`
   You should see: `Running on http://127.0.0.1:5000`

2. **Check Environment Variables**:
   \`\`\`bash
   # In .env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000
   \`\`\`

3. **Test Backend Directly**:
   \`\`\`bash
   curl http://localhost:5000/health
   # Should return: {"status":"healthy","model_loaded":true}
   \`\`\`

4. **Common Backend Issues**:
   - **Port 5000 in use**: Kill other processes or change port
   - **Missing dependencies**: Run `pip install -r requirements.txt`
   - **Python version**: Ensure Python 3.9+ is installed
   - **Model file missing**: The app will work but predictions may fail

#### **Solution 3: Check Network Issues**
- **CORS Errors**: Check browser developer tools console
- **Firewall**: Ensure localhost:5000 is accessible
- **Antivirus**: Some antivirus software blocks local servers

### Other Common Issues

#### "Cannot connect to server"
- **Mock Mode**: Remove `NEXT_PUBLIC_API_URL` from environment variables
- **Backend Mode**: Ensure Flask server is running on the correct port
- **Network**: Check if `http://localhost:5000/health` returns JSON

#### Authentication Issues
- **Clear Storage**: Open browser dev tools → Application → Local Storage → Clear
- **Token Expired**: Sign out and sign back in
- **Mock Mode**: Use `demo@example.com` / `demo123`

#### Image Upload Issues
- **File Size**: Maximum 16MB per image
- **File Type**: Only image files (jpg, png, gif, etc.) are supported
- **Network**: Large images may timeout in slow connections

## Usage

... existing code ...

## API Endpoints

... existing code ...

## Model Information

... existing code ...

## Deployment

... existing code ...

## Project Structure

... existing code ...

## Contributing

... existing code ...

## License

This project is licensed under the MIT License.

## Acknowledgments

... existing code ...
\`\`\`

```env file="" isHidden
