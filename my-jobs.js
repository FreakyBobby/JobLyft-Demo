document.addEventListener('DOMContentLoaded', async function() {
    // Initialize job filters
    const jobSearch = document.getElementById('job-search');
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');
    const jobsList = document.querySelector('.jobs-list');
    
    // Load jobs
    async function loadJobs() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch('/api/jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const jobs = await response.json();
            displayJobs(jobs);
            updateJobStats(jobs);
        } catch (error) {
            console.error('Error loading jobs:', error);
            showNotification(error.message || 'Failed to load jobs', 'error');
        }
    }

    // Display jobs
    function displayJobs(jobs) {
        if (!jobsList) return;
        
        if (jobs.length === 0) {
            jobsList.innerHTML = `
                <div class="no-jobs">
                    <i class="fas fa-briefcase"></i>
                    <h3>No Jobs Found</h3>
                    <p>You haven't posted any jobs yet.</p>
                    <a href="post-job.html" class="btn btn-primary">Post Your First Job</a>
                </div>
            `;
            return;
        }

        jobsList.innerHTML = jobs.map(job => `
            <div class="job-item" data-id="${job.id}">
                <div class="job-header">
                    <h3>${job.title}</h3>
                    <span class="job-status ${job.status.toLowerCase()}">${job.status}</span>
                </div>
                <div class="job-details">
                    <p><i class="fas fa-building"></i> ${job.company}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                    <p><i class="fas fa-briefcase"></i> ${job.jobType}</p>
                    <p><i class="fas fa-calendar-alt"></i> Posted: ${new Date(job.postedAt).toLocaleDateString()}</p>
                    <p><i class="fas fa-users"></i> ${job.applications || 0} Applications</p>
                </div>
                <div class="job-actions">
                    <button class="btn btn-secondary view-applications" onclick="viewApplications('${job.id}')">
                        View Applications
                    </button>
                    <button class="btn btn-primary edit-job" onclick="editJob('${job.id}')">
                        Edit
                    </button>
                    <button class="btn btn-danger delete-job" onclick="deleteJob('${job.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Filter and sort jobs
    function filterAndSortJobs() {
        const searchTerm = jobSearch.value.toLowerCase();
        const status = statusFilter.value;
        const sort = sortFilter.value;

        const jobItems = document.querySelectorAll('.job-item');
        let visibleJobs = Array.from(jobItems);

        // Filter by search term
        if (searchTerm) {
            visibleJobs = visibleJobs.filter(job => {
                const title = job.querySelector('h3').textContent.toLowerCase();
                const company = job.querySelector('.fas.fa-building').parentElement.textContent.toLowerCase();
                return title.includes(searchTerm) || company.includes(searchTerm);
            });
        }

        // Filter by status
        if (status !== 'all') {
            visibleJobs = visibleJobs.filter(job => {
                const jobStatus = job.querySelector('.job-status').textContent.toLowerCase();
                return jobStatus === status;
            });
        }

        // Sort jobs
        visibleJobs.sort((a, b) => {
            const dateA = new Date(a.querySelector('.fa-calendar-alt').parentElement.textContent.split('Posted: ')[1]);
            const dateB = new Date(b.querySelector('.fa-calendar-alt').parentElement.textContent.split('Posted: ')[1]);

            if (sort === 'newest') {
                return dateB - dateA;
            } else if (sort === 'oldest') {
                return dateA - dateB;
            } else if (sort === 'applications') {
                const appsA = parseInt(a.querySelector('.fa-users').parentElement.textContent);
                const appsB = parseInt(b.querySelector('.fa-users').parentElement.textContent);
                return appsB - appsA;
            }
        });

        // Update visibility
        jobItems.forEach(job => job.style.display = 'none');
        visibleJobs.forEach(job => job.style.display = '');

        // Update stats for visible jobs
        updateJobStats(visibleJobs);
    }

    // Update job statistics
    function updateJobStats(jobs) {
        const statsCard = document.querySelector('.stats-card');
        if (!statsCard) return;

        let totalJobs = 0;
        let activeJobs = 0;
        let pendingJobs = 0;
        let expiredJobs = 0;
        let totalApplications = 0;

        if (Array.isArray(jobs)) {
            // If jobs is an array of job objects from the API
            totalJobs = jobs.length;
            activeJobs = jobs.filter(job => job.status === 'active').length;
            pendingJobs = jobs.filter(job => job.status === 'pending').length;
            expiredJobs = jobs.filter(job => job.status === 'expired').length;
            totalApplications = jobs.reduce((sum, job) => sum + (job.applications || 0), 0);
        } else {
            // If jobs is a NodeList of job elements from filtering
            totalJobs = jobs.length;
            activeJobs = Array.from(jobs).filter(job => 
                job.querySelector('.job-status').textContent.toLowerCase() === 'active'
            ).length;
            pendingJobs = Array.from(jobs).filter(job => 
                job.querySelector('.job-status').textContent.toLowerCase() === 'pending'
            ).length;
            expiredJobs = Array.from(jobs).filter(job => 
                job.querySelector('.job-status').textContent.toLowerCase() === 'expired'
            ).length;
            totalApplications = Array.from(jobs).reduce((sum, job) => {
                const appCount = parseInt(job.querySelector('.fa-users').parentElement.textContent) || 0;
                return sum + appCount;
            }, 0);
        }

        // Update statistics safely
        const stats = [
            { selector: '.stat-item:nth-child(1) .stat-number', value: totalJobs },
            { selector: '.stat-item:nth-child(2) .stat-number', value: activeJobs },
            { selector: '.stat-item:nth-child(3) .stat-number', value: pendingJobs },
            { selector: '.stat-item:nth-child(4) .stat-number', value: expiredJobs }
        ];

        stats.forEach(({ selector, value }) => {
            const element = statsCard.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        });

        // Update applications count
        const applicationsElement = document.querySelector('.stats-card:last-child .stat-item:first-child .stat-number');
        if (applicationsElement) {
            applicationsElement.textContent = totalApplications;
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add event listeners
    if (jobSearch) {
        jobSearch.addEventListener('input', filterAndSortJobs);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAndSortJobs);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', filterAndSortJobs);
    }

    // Load initial jobs
    loadJobs();
});