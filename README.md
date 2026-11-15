# COMP229 Assignment 3 — Full Stack Portfolio
Student: Mohammad Smadi | Student ID: 301432374

## Features
- React portfolio: Home, About, Projects, Education, Services, Contact
- Express/Mongoose REST APIs for projects, educations, contacts
- JWT signup, signin, signout, session storage, protected admin actions
- Regular users can view projects and education; admin can create, update, delete; anyone can send a contact message; only admin can read contact messages
- MongoDB Atlas storage, form validation and basic error handling

## Local setup
1. Install Node.js 20+ and create a MongoDB Atlas database named `Skeleton`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. In project root: `npm install` then `npm start`.
4. In a **second terminal**: `cd client`, `npm install`, `npm run dev`.
5. Open http://localhost:5173. Backend API is at http://localhost:3000.
6. Sign in using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`. Regular accounts can sign up from the UI.
7. To deploy frontend, set `VITE_API_URL` to your deployed backend origin before building.

## API routes
POST /auth/signup; POST /auth/signin; GET /auth/signout; GET /auth/me (JWT)
GET /api/projects; GET /api/projects/:id; POST /api/projects (admin); PUT /api/projects/:id (admin); DELETE /api/projects/:id (admin); DELETE /api/projects (admin)
GET /api/educations; GET /api/educations/:id; POST /api/educations (admin); PUT /api/educations/:id (admin); DELETE /api/educations/:id (admin); DELETE /api/educations (admin)
POST /api/contacts (public); GET /api/contacts (admin); GET /api/contacts/:id (admin); PUT /api/contacts/:id (admin); DELETE /api/contacts/:id (admin); DELETE /api/contacts (admin)

## Submission
The source ZIP is included. Screenshots and GitHub URL must be added after actually running/testing and pushing the project. No screenshots or GitHub URL are fabricated.
