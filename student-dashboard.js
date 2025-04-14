document.addEventListener('DOMContentLoaded', () => {
    // Sample application data (in a real application, this would come from a backend)
    let applications = [
        {
            id: 1,
            jobTitle: 'Software Engineer',
            company: 'Tech Corp',
            appliedDate: '2024-04-02',
            status: 'pending',
            jobDescription: 'Looking for an experienced software engineer...',
            location: 'San Francisco, CA',
            jobType: 'full-time',
            industry: 'tech',
            salaryRange: '$100,000 - $150,000',
            applicationNotes: 'Applied with resume and cover letter',
            employerContact: 'jobs@techcorp.com'
        },
        // Add more sample applications as needed
    ];

    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    const applicationsTableBody = document.getElementById('applicationsTableBody');
    const applicationDetailsModal = document.getElementById('applicationDetailsModal');
    const applicationDetailsContent = document.getElementById('applicationDetailsContent');
    const closeModal = document.getElementById('closeModal');

    function updateStats() {
        const totalApplications = applications.length;
        const pendingApplications = applications.filter(app => app.status === 'pending').length;
        const acceptedApplications = applications.filter(app => app.status === 'accepted').length;

        document.getElementById('totalApplications').textContent = totalApplications;
        document.getElementById('pendingApplications').textContent = pendingApplications;
        document.getElementById('acceptedApplications').textContent = acceptedApplications;
    }

    function filterApplications() {
        const status = statusFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        return applications.filter(app => {
            const matchesStatus = status === 'all' || app.status === status;
            const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm) ||
                                app.company.toLowerCase().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }

    function displayApplications(filteredApplications) {
        applicationsTableBody.innerHTML = '';

        filteredApplications.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.jobTitle}</td>
                <td>${app.company}</td>
                <td>${new Date(app.appliedDate).toLocaleDateString()}</td>
                <td><span class="status-badge status-${app.status}">${app.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="viewApplication(${app.id})">View Details</button>
                    </div>
                </td>
            `;
            applicationsTableBody.appendChild(row);
        });
    }

    function viewApplication(applicationId) {
        const application = applications.find(a => a.id === applicationId);
        if (!application) return;

        applicationDetailsContent.innerHTML = `
            <div class="job-details">
                <p><strong>Job Title:</strong> ${application.jobTitle}</p>
                <p><strong>Company:</strong> ${application.company}</p>
                <p><strong>Location:</strong> ${application.location}</p>
                <p><strong>Job Type:</strong> ${application.jobType}</p>
                <p><strong>Industry:</strong> ${application.industry}</p>
                <p><strong>Salary Range:</strong> ${application.salaryRange}</p>
                <p><strong>Job Description:</strong> ${application.jobDescription}</p>
                <p><strong>Application Notes:</strong> ${application.applicationNotes}</p>
                <p><strong>Employer Contact:</strong> ${application.employerContact}</p>
                <p><strong>Applied Date:</strong> ${new Date(application.appliedDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${application.status}">${application.status}</span></p>
            </div>
        `;
        applicationDetailsModal.style.display = 'block';
    }

    // Event listeners
    statusFilter.addEventListener('change', () => {
        displayApplications(filterApplications());
    });

    searchInput.addEventListener('input', () => {
        displayApplications(filterApplications());
    });

    closeModal.addEventListener('click', () => {
        applicationDetailsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === applicationDetailsModal) {
            applicationDetailsModal.style.display = 'none';
        }
    });

    // Make function available globally
    window.viewApplication = viewApplication;

    // Initial display
    updateStats();
    displayApplications(applications);
}); 