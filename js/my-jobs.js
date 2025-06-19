document.addEventListener('DOMContentLoaded', function() {
    // Initialize job filters
    initializeFilters();
    
    // Load jobs
    loadJobs();
});

async function loadJobs() {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in to view your jobs', 'error');
        return;
    }

    try {
        const response = await fetch('/api/jobs/my-jobs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load jobs');
        }

        const jobs = await response.json();
        displayJobs(jobs);
        updateJobStats(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        showNotification('Failed to load jobs', 'error');
    }
}

function displayJobs(jobs) {
    const jobList = document.getElementById('jobList');
    jobList.innerHTML = '';

    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'job-item';
        jobElement.innerHTML = `
            <div class="job-header">
                <h3>${job.title}</h3>
                <span class="job-status ${job.status}">${job.status}</span>
            </div>
            <div class="job-details">
                <p><i class="fas fa-building"></i> ${job.company}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                <p><i class="fas fa-clock"></i> ${job.type}</p>
                <p><i class="fas fa-dollar-sign"></i> ${job.salary}</p>
            </div>
            <div class="job-actions">
                <button class="btn btn-primary" onclick="editJob('${job.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteJob('${job.id}')">Delete</button>
            </div>
        `;
        jobList.appendChild(jobElement);
    });
}

function initializeFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');

    searchInput.addEventListener('input', filterAndSortJobs);
    statusFilter.addEventListener('change', filterAndSortJobs);
    sortBy.addEventListener('change', filterAndSortJobs);
}

function filterAndSortJobs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    const jobItems = document.querySelectorAll('.job-item');
    let visibleCount = 0;

    jobItems.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const status = item.querySelector('.job-status').textContent;

        const matchesSearch = title.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;

        if (matchesSearch && matchesStatus) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // Update "no results" message
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function updateJobStats(jobs) {
    const stats = {
        total: jobs.length,
        active: jobs.filter(job => job.status === 'active').length,
        pending: jobs.filter(job => job.status === 'pending').length,
        expired: jobs.filter(job => job.status === 'expired').length,
        applications: jobs.reduce((sum, job) => sum + (job.applications || 0), 0)
    };

    document.getElementById('totalJobs').textContent = stats.total;
    document.getElementById('activeJobs').textContent = stats.active;
    document.getElementById('pendingJobs').textContent = stats.pending;
    document.getElementById('expiredJobs').textContent = stats.expired;
    document.getElementById('totalApplications').textContent = stats.applications;
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in to delete jobs', 'error');
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
        loadJobs(); // Reload the jobs list
    } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('Failed to delete job', 'error');
    }
}

function editJob(jobId) {
    window.location.href = `edit-job.html?id=${jobId}`;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 