document.addEventListener('DOMContentLoaded', () => {
    // Sample job data (in a real application, this would come from a backend)
    let jobs = [
        {
            id: 1,
            title: 'Software Engineer',
            company: 'Tech Corp',
            postedDate: '2024-04-02',
            status: 'pending',
            description: 'Looking for an experienced software engineer...',
            location: 'San Francisco, CA',
            jobType: 'full-time',
            industry: 'tech',
            salaryMin: 100000,
            salaryMax: 150000,
            qualifications: 'Bachelor\'s degree in Computer Science...',
            contactInfo: 'jobs@techcorp.com'
        },
        // Add more sample jobs as needed
    ];

    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    const jobsTableBody = document.getElementById('jobsTableBody');
    const jobDetailsModal = document.getElementById('jobDetailsModal');
    const jobDetailsContent = document.getElementById('jobDetailsContent');
    const closeModal = document.getElementById('closeModal');
    const approveJob = document.getElementById('approveJob');
    const rejectJob = document.getElementById('rejectJob');

    let currentJobId = null;

    function updateStats() {
        const totalPostings = jobs.length;
        const pendingPostings = jobs.filter(job => job.status === 'pending').length;
        const activeJobs = jobs.filter(job => job.status === 'approved').length;

        document.getElementById('totalPostings').textContent = totalPostings;
        document.getElementById('pendingPostings').textContent = pendingPostings;
        document.getElementById('activeJobs').textContent = activeJobs;
    }

    function filterJobs() {
        const status = statusFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        return jobs.filter(job => {
            const matchesStatus = status === 'all' || job.status === status;
            const matchesSearch = job.title.toLowerCase().includes(searchTerm) ||
                                job.company.toLowerCase().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }

    function displayJobs(filteredJobs) {
        jobsTableBody.innerHTML = '';

        filteredJobs.forEach(job => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${job.title}</td>
                <td>${job.company}</td>
                <td>${new Date(job.postedDate).toLocaleDateString()}</td>
                <td><span class="status-badge status-${job.status}">${job.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="viewJob(${job.id})">View</button>
                        ${job.status === 'pending' ? `
                            <button class="btn-approve" onclick="approveJob(${job.id})">Approve</button>
                            <button class="btn-reject" onclick="rejectJob(${job.id})">Reject</button>
                        ` : ''}
                    </div>
                </td>
            `;
            jobsTableBody.appendChild(row);
        });
    }

    function viewJob(jobId) {
        const job = jobs.find(j => j.id === jobId);
        if (!job) return;

        currentJobId = jobId;
        jobDetailsContent.innerHTML = `
            <div class="job-details">
                <p><strong>Job Title:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Job Type:</strong> ${job.jobType}</p>
                <p><strong>Industry:</strong> ${job.industry}</p>
                <p><strong>Salary Range:</strong> $${job.salaryMin} - $${job.salaryMax}</p>
                <p><strong>Description:</strong> ${job.description}</p>
                <p><strong>Qualifications:</strong> ${job.qualifications}</p>
                <p><strong>Contact Info:</strong> ${job.contactInfo}</p>
            </div>
        `;
        jobDetailsModal.style.display = 'block';
    }

    function updateJobStatus(jobId, newStatus) {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            job.status = newStatus;
            updateStats();
            displayJobs(filterJobs());
            jobDetailsModal.style.display = 'none';
        }
    }

    // Event listeners
    statusFilter.addEventListener('change', () => {
        displayJobs(filterJobs());
    });

    searchInput.addEventListener('input', () => {
        displayJobs(filterJobs());
    });

    closeModal.addEventListener('click', () => {
        jobDetailsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === jobDetailsModal) {
            jobDetailsModal.style.display = 'none';
        }
    });

    // Make functions available globally
    window.viewJob = viewJob;
    window.approveJob = (jobId) => updateJobStatus(jobId, 'approved');
    window.rejectJob = (jobId) => updateJobStatus(jobId, 'rejected');

    // Initial display
    updateStats();
    displayJobs(jobs);
}); 