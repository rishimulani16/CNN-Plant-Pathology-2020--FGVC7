# Apple Leaf Disease Detection Backend

Flask-based backend API for the Apple Leaf Disease Detection application.

## Features

- User authentication (signup/login) with JWT tokens
- SQLite database for user management
- ML model integration using TensorFlow/Keras
- Image upload and processing
- Disease prediction API
- CORS enabled for frontend integration

## Setup Instructions

### Local Development

1. **Install Python Dependencies**
   \`\`\`bash
   cd backend
   pip install -r requirements.txt
   \`\`\`

2. **Run the Application**
   \`\`\`bash
   python app.py
   \`\`\`
   
   The API will be available at `http://localhost:5000`

### Production Deployment

1. **Using Docker**
   \`\`\`bash
   docker build -t apple-leaf-backend .
   docker run -p 5000:5000 apple-leaf-backend
   \`\`\`

2. **Environment Variables**
   - `SECRET_KEY`: JWT secret key (required for production)
   - `FLASK_ENV`: Set to 'production' for production deployment
   - `PORT`: Port number (default: 5000)

## API Endpoints

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - User login

### Prediction
- `POST /predict` - Upload image and get disease prediction (requires authentication)

### Health Check
- `GET /health` - Check API and model status

## Model Information

The backend uses a MobileNetV2-based model trained on the Plant Pathology 2020 dataset to detect:
- Healthy leaves
- Apple scab
- Cedar apple rust  
- Multiple diseases

## Database

Uses SQLite for user management. The database file (`users.db`) is created automatically on first run.
