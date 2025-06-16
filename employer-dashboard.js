document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    let jobs = [];
    let applications = [];
    let user = null;

    // Load user profile
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            user = await response.json();
            updateUserInterface();
        } catch (error) {
            console.error('Error loading user profile:', error);
            showNotification('Failed to load user profile', 'error');
        }
    }

    // Update user interface with user data
    function updateUserInterface() {
        if (user) {
            const userEmailElement = document.getElementById('user-email');
            const welcomeNameElement = document.getElementById('welcome-name');
            
            if (userEmailElement) {
                userEmailElement.textContent = user.email;
            }
            
            if (welcomeNameElement) {
                welcomeNameElement.textContent = user.name || 'User';
            }
        }
    }

    // Load jobs from API
    async function loadJobs() {
        try {
            const response = await fetch('/api/jobs?mine=true', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            jobs = await response.json();
            displayJobs();
            updateStats();
        } catch (error) {
            console.error('Error loading jobs:', error);
            showNotification('Failed to load jobs', 'error');
        }
    }

    // Load applications from API
    async function loadApplications() {
        try {
            const response = await fetch('/api/applications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            applications = await response.json();
            displayApplications();
        } catch (error) {
            console.error('Error loading applications:', error);
            showNotification('Failed to load applications', 'error');
        }
    }

    // Update dashboard statistics
    function updateStats() {
        const activeJobs = jobs.filter(job => job.status === 'active').length;
        const totalApplications = applications.length;
        const jobViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
        const candidatesHired = 0; // This would need to be tracked separately

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-number');
        if (statCards[0]) statCards[0].textContent = activeJobs;
        if (statCards[1]) statCards[1].textContent = totalApplications;
        if (statCards[2]) statCards[2].textContent = jobViews || '1,245'; // Default if no view tracking
        if (statCards[3]) statCards[3].textContent = candidatesHired;
    }

    // Display jobs in the table
    function displayJobs() {
        const jobsTableBody = document.querySelector('.dashboard-table tbody');
        if (!jobsTableBody) return;

        if (jobs.length === 0) {
            jobsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        <p>No jobs found. <a href="post-job.html">Post your first job</a></p>
                    </td>
                </tr>
            `;
            return;
        }

        jobsTableBody.innerHTML = jobs.map(job => `
            <tr>
                <td>${job.title}</td>
                <td>${new Date(job.postedAt).toLocaleDateString()}</td>
                <td>${job.applications || 0}</td>
                <td><span class="status ${job.status.toLowerCase()}">${job.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="View Applications" onclick="viewApplications('${job.id}')">
                            <i class="fas fa-users"></i>
                        </button>
                        <button class="btn-icon" title="Edit" onclick="editJob('${job.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" title="Delete" onclick="deleteJob('${job.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Display recent applications
    function displayApplications() {
        const applicationsList = document.querySelector('.application-list');
        if (!applicationsList) return;

        if (applications.length === 0) {
            applicationsList.innerHTML = `
                <div class="application-item">
                    <div class="application-info">
                        <h3>No applications yet</h3>
                        <p>Applications will appear here when candidates apply to your jobs.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Show only the most recent 3 applications
        const recentApplications = applications.slice(0, 3);
        
        applicationsList.innerHTML = recentApplications.map(application => `
            <div class="application-item">
                <div class="application-info">
                    <h3>${application.applicantName || 'Anonymous Applicant'}</h3>
                    <p>${application.jobTitle || 'Unknown Position'}</p>
                    <span class="application-date">Applied: ${new Date(application.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="application-actions">
                    <button class="btn btn-primary" onclick="viewResume('${application.id}')">View Resume</button>
                    <button class="btn btn-secondary" onclick="contactApplicant('${application.id}')">Contact</button>
                </div>
            </div>
        `).join('');
    }

    // View applications for a specific job
    async function viewApplications(jobId) {
        try {
            const response = await fetch(`/api/jobs/${jobId}/applications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            const jobApplications = await response.json();
            
            if (jobApplications.length === 0) {
                showNotification('No applications found for this job', 'info');
            } else {
                showNotification(`Found ${jobApplications.length} application(s) for this job`, 'success');
                console.log('Job Applications:', jobApplications);
                // TODO: Implement applications modal/page
            }
        } catch (error) {
            console.error('Error viewing applications:', error);
            showNotification('Failed to load applications', 'error');
        }
    }

    // Edit job
    function editJob(jobId) {
        window.location.href = `post-job.html?edit=${jobId}`;
    }

    // Delete job
    async function deleteJob(jobId) {
        if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete job');
            }

            showNotification('Job deleted successfully', 'success');
            await loadJobs(); // Reload the jobs list
        } catch (error) {
            console.error('Error deleting job:', error);
            showNotification('Failed to delete job', 'error');
        }
    }

    // View resume
    function viewResume(applicationId) {
        const application = applications.find(app => app.id === applicationId);
        if (application && application.resume) {
            // TODO: Implement resume viewer
            showNotification('Resume viewing not yet implemented', 'info');
            console.log('Resume content:', application.resume);
        } else {
            showNotification('Resume not found', 'error');
        }
    }

    // Contact applicant
    function contactApplicant(applicationId) {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
            // TODO: Implement contact functionality
            showNotification('Contact feature not yet implemented', 'info');
            console.log('Contact application:', application);
        } else {
            showNotification('Application not found', 'error');
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        });
    }

    // Make functions available globally
    window.viewApplications = viewApplications;
    window.editJob = editJob;
    window.deleteJob = deleteJob;
    window.viewResume = viewResume;
    window.contactApplicant = contactApplicant;

    // Initial data load
    await Promise.all([loadUserProfile(), loadJobs(), loadApplications()]);
}); 