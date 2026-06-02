# AI Resume Analyzer

Hey! 👋 Welcome to my AI Resume Analyzer project. 

I built this to make it easier to get quick, actionable feedback on resumes. Instead of guessing what ATS (Applicant Tracking Systems) or recruiters want to see, this app lets you upload your resume (PDF), analyzes the text using AI, and gives you insights on how to improve it. It also has a neat feature to match your resume against specific job descriptions to see how well you fit.

## What's inside?

It's a full-stack MERN-ish application, split cleanly into frontend and backend folders.

**Frontend:**
- React (bootstrapped with Vite for speed)
- Tailwind CSS for clean, responsive styling
- React Router for navigation
- Chart.js to visualize resume stats and scores

**Backend:**
- Node.js & Express
- MongoDB (via Mongoose) to store user data and past resume analyses
- Multer & PDF-Parse for handling file uploads and extracting text from PDFs
- JWT & bcrypt for secure user authentication

## Main Features

- **User Authentication:** Secure sign-up and login so your data stays yours.
- **PDF Uploads:** Easy drag-and-drop or file select for your resume (PDF format, up to 5MB).
- **AI Analysis:** Get detailed, constructive feedback on your skills, experience, and overall resume strength.
- **Job Matching:** Paste a job description and see how well your resume aligns with it.
- **Personal Dashboard:** Look back at your past resume scores and analyses.

## Running it locally

If you want to spin this up on your own machine to play around with the code, here's how to do it.

### 1. Grab the code
```bash
git clone https://github.com/rozichilwal/AI-resume-analyzer
cd Ai-resume-analyzer
```

### 2. Set up the Backend
Open up a terminal and head into the backend folder:
```bash
cd backend
npm install
```

Then, start the backend server:
```bash
npm run dev
```
*(It should boot up on port 5000)*

### 3. Set up the Frontend
Open a *second* terminal window and navigate to the frontend folder:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*(The frontend will usually run on http://localhost:5173)*

That's it! You should now be able to open the app in your browser and start analyzing resumes.

## Future Plans / Contributing

There's always room for improvement! If you spot any bugs or want to add a cool new feature, feel free to fork the repo and open a Pull Request. 
