# MEDI-VAULT: AI-Powered Medical Document Management

## Project Description
MEDI-VAULT is a full-stack healthcare application that allows users to securely upload, manage, and simplify medical documents using AI. Features include document storage, treatment plans, medicine reminders, vaccination tracking, Google OAuth authentication, and more.

## Live Demo
- Frontend: [https://medi-vault-zeta.vercel.app](https://medi-vault-zeta.vercel.app)
- Backend API: [https://medi-vault-zsg1.onrender.com](https://medi-vault-zsg1.onrender.com)

## Technologies Used
- Frontend: React, Material UI, Axios
- Backend: Node.js, Express, MongoDB Atlas, Mongoose
- Authentication: JWT, Google OAuth
- Storage: AWS S3
- AI: Google Gemini API (for medical report analysis)
- Deployment: Backend on Render, Frontend on Vercel

## Features
- User registration/login with JWT and Google OAuth integration
- Secure medical document upload and management (PDF, images, DOCX)
- AI-powered document text extraction and summarization
- Medicine reminders, vaccination and surgery records
- Search nearby medical facilities via map with geolocation
- Responsive UI built with Material UI and React Hooks

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (or yarn)
- MongoDB Atlas account
- AWS S3 bucket and credentials
- Google Cloud Console project for OAuth and Gemini API
- Google OAuth credentials (Client ID, Secret)

### Installation

#### Backend Setup
1. Clone the repository and navigate to backend directory:
cd medi_vault-backend
2. Install dependencies:
npm install
3. Create a `.env` file in backend root (do NOT commit this file). Add the following keys with your own values:
PORT=3000
MONGO_URI=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GEMINI_API_KEY=
JWT_SECRET=
4. Start the backend server:
npm start

#### Frontend Setup
1. Navigate to frontend directory:
cd medi_vault-frontend
2. Install dependencies:
npm install
3. Create a `.env` file in frontend root (do NOT commit this file). Add:
REACT_APP_API_URL=https://medi-vault-zsg1.onrender.com
4. Run the development server or build for production:
npm start 
or
npm run build

### Deployment Links
- Backend deployed on: [Render](https://medi-vault-zsg1.onrender.com)
- Frontend deployed on: [Vercel](https://medi-vault-zeta.vercel.app)

Remember to set environment variables on Render and Vercel dashboards accordingly to make deployed apps function correctly.

## Usage
- Register or log in via email/google oauth.
- Upload medical documents and receive AI-powered summaries.
- Create and manage medication reminders.
- Track vaccination and surgery history.
- Locate nearby medical services on interactive map.

## Contributing
Contributions welcome! Please fork this repo and open pull requests for bug fixes, features, or documentation improvements.

## License
MIT License

## Contact
Created by Ashwin Yadav, Diptanshu Vishwa & Diyasha Nag 
GitHub: [[MEDI-VAULT](https://github.com/DiptanshuVishwa/MEDI-VAULT)]  

- **Diptanshu Vishwa:** [diptanshuvishwa364@gmail.com](mailto:diptanshuvishwa364@gmail.com)  
- **Diyasha Nag:** [diyashanag23@gmail.com](mailto:diyashanag23@gmail.com)  
- **Ashwin Yadav:** [ashwinyadavv911@gmail.com](mailto:ashwinyadavv911@gmail.com) 

---

### Notes on `.env`
**Never commit `.env` files with secrets to public repos!**  
Provide a `.env.example` file as a template for the required keys without values.  
Users must copy `.env.example` to `.env` and fill in their own secrets locally or in deployment settings.
