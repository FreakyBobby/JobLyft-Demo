# JobLyft2 - Job Board Website

This is a job board website that allows users to register, login, post jobs, and search for jobs. The website uses SQLite for local data storage.

## Setup Instructions

### Option 1: Running Locally

#### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

#### Installation

1. Clone the repository or download the code
   ```
   git clone https://github.com/FreakyBobby/JobLyft2.git
   ```

2. Navigate to the project directory
   ```
   cd JobLyft2
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the server
   ```
   node server.js
   ```

5. Access the website in your browser
   ```
   http://localhost:8080
   ```

### Option 2: Running in GitHub Codespaces

1. Open the repository in GitHub Codespaces
   - Go to your GitHub repository
   - Click the "Code" button
   - Select the "Codespaces" tab
   - Click "Create codespace on main"

2. Once the Codespace is ready, open a terminal and run:
   ```
   npm install
   node server.js
   ```

3. When the server starts, Codespaces will detect the port (8080) and provide a "Open in Browser" option
   - Click this option to view the website
   - Alternatively, go to the "PORTS" tab, find port 8080, and click the globe icon

4. If you need to make the port public (for sharing with others):
   - Go to the "PORTS" tab
   - Right-click on port 8080
   - Select "Port Visibility" and choose "Public"

## Features

- **User Registration**: Create new employer or job seeker accounts
- **User Login**: Secure authentication with JWT tokens
- **Job Posting**: Employers can post new job listings
- **Job Search**: Job seekers can search and filter job listings
- **Job Application**: Job seekers can apply to jobs with resume and cover letter

## Demo Accounts

For your demo, you can register new accounts or use the following flow:

1. Register as an employer
2. Post a job
3. Register as a job seeker (in a different browser or incognito window)
4. Search for jobs and apply

## Database

The website uses SQLite for data storage. The database file is created automatically in the `data` directory when you start the server for the first time.

## Troubleshooting

- If you encounter any issues with the server, check the console for error messages
- Make sure port 8080 is not being used by another application
- If needed, you can change the port in `server.js` (line 346)

### GitHub Codespaces Specific Troubleshooting

- If you can't access the website, check that port forwarding is enabled
- If you need to change the port, update both the server.js file and the forwarded port in the PORTS tab
- If database errors occur, ensure the data directory exists and is writable

## Technical Details

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: SQLite (using sqlite3)
- Authentication: JWT (JSON Web Tokens)
