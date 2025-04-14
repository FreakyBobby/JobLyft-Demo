document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const filtersSidebar = document.getElementById('filters-sidebar');
    const sortSelect = document.getElementById('sort-select');
    const jobList = document.getElementById('job-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const pagination = document.getElementById('pagination');
    const noResultsMessage = document.getElementById('no-results-message');
    
    // Pagination state
    let currentPage = 1;
    const jobsPerPage = 10;
    
    // Current filters
    const currentFilters = {
        keyword: '',
        location: '',
        jobType: '',
        industry: '',
        experience: '',
        sortBy: 'postedAt',
        sortOrder: 'desc'
    };
    
    // Fetch jobs from API
    async function fetchJobs() {
        try {
            // Show loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'flex';
            }
            if (jobList) {
                jobList.innerHTML = '';
            }
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            // Fetch jobs from API
            const response = await fetch('/api/jobs', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }
            
            const jobs = await response.json();
            
            // Filter and sort jobs
            let filteredJobs = jobs.filter(job => {
                const matchesKeyword = !currentFilters.keyword || 
                    job.title.toLowerCase().includes(currentFilters.keyword.toLowerCase()) ||
                    job.company.toLowerCase().includes(currentFilters.keyword.toLowerCase()) ||
                    job.description.toLowerCase().includes(currentFilters.keyword.toLowerCase());
                    
                const matchesLocation = !currentFilters.location || 
                    job.location.toLowerCase().includes(currentFilters.location.toLowerCase());
                    
                const matchesJobType = !currentFilters.jobType || 
                    job.jobType.toLowerCase() === currentFilters.jobType.toLowerCase();
                    
                const matchesIndustry = !currentFilters.industry || 
                    job.industry.toLowerCase() === currentFilters.industry.toLowerCase();
                    
                return matchesKeyword && matchesLocation && matchesJobType && matchesIndustry;
            });
            
            // Sort jobs
            filteredJobs.sort((a, b) => {
                const dateA = new Date(a[currentFilters.sortBy]);
                const dateB = new Date(b[currentFilters.sortBy]);
                return currentFilters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
            
            // Paginate jobs
            const startIndex = (currentPage - 1) * jobsPerPage;
            const endIndex = startIndex + jobsPerPage;
            const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
            
            // Display jobs
            displayJobs(paginatedJobs);
            
            // Update pagination
            const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
            updatePagination(filteredJobs.length, totalPages);
            
        } catch (error) {
            console.error('Error fetching jobs:', error);
            showNotification(error.message || 'Failed to fetch jobs', 'error');
        } finally {
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }
    
    // Display jobs in the list
    function displayJobs(jobs) {
        if (!jobList) return;
        
        // Update the results count display
        const resultsCountElement = document.getElementById('results-count');
        if (resultsCountElement) {
            resultsCountElement.textContent = jobs.length;
        }
        
        if (jobs.length === 0) {
            if (noResultsMessage) {
                noResultsMessage.style.display = 'block';
            }
            jobList.innerHTML = `
                <div class="no-jobs">
                    <i class="fas fa-search"></i>
                    <h3>No Jobs Found</h3>
                    <p>Try adjusting your search filters</p>
                </div>
            `;
            return;
        }
        
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        
        jobList.innerHTML = jobs.map(job => `
            <div class="job-card" data-id="${job.id}">
                <div class="job-header">
                    <h3>${job.title}</h3>
                    <button class="save-job" onclick="saveJob('${job.id}')">
                        <i class="far fa-bookmark"></i>
                    </button>
                </div>
                <div class="job-company">
                    <i class="fas fa-building"></i>
                    <span>${job.company}</span>
                </div>
                <div class="job-details">
                    <div class="detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${job.location}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-briefcase"></i>
                        <span>${job.jobType}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${job.salaryRange}</span>
                    </div>
                </div>
                <div class="job-description">
                    ${job.description.slice(0, 200)}...
                </div>
                <div class="job-footer">
                    <span class="posted-date">
                        <i class="fas fa-clock"></i>
                        Posted ${formatDate(job.postedAt)}
                    </span>
                    <a href="job-details.html?id=${job.id}" class="btn btn-primary">View Details</a>
                </div>
            </div>
        `).join('');
    }
    
    // Update pagination
    function updatePagination(total, pages) {
        if (!pagination) return;
        
        // Update the page info display if it exists
        const pageInfoElement = document.querySelector('.page-info');
        if (pageInfoElement) {
            const startItem = total === 0 ? 0 : (currentPage - 1) * jobsPerPage + 1;
            const endItem = Math.min(currentPage * jobsPerPage, total);
            pageInfoElement.textContent = `${startItem}-${endItem} of ${total}`;
        }
        
        // If no jobs or only one page, hide pagination
        if (total === 0 || pages <= 1) {
            pagination.style.display = 'none';
            return;
        } else {
            pagination.style.display = 'flex';
        }
        
        const paginationHTML = [];
        
        // Previous button
        paginationHTML.push(`
            <button class="page-btn prev ${currentPage === 1 ? 'disabled' : ''}"
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
                Previous
            </button>
        `);
        
        // Page numbers
        for (let i = 1; i <= pages; i++) {
            if (
                i === 1 || // First page
                i === pages || // Last page
                (i >= currentPage - 2 && i <= currentPage + 2) // Pages around current page
            ) {
                paginationHTML.push(`
                    <button class="page-btn ${i === currentPage ? 'active' : ''}"
                            data-page="${i}">
                        ${i}
                    </button>
                `);
            } else if (
                (i === currentPage - 3 && i > 1) || // Show dots before current page
                (i === currentPage + 3 && i < pages) // Show dots after current page
            ) {
                paginationHTML.push('<span class="page-dots">...</span>');
            }
        }
        
        // Next button
        paginationHTML.push(`
            <button class="page-btn next ${currentPage === pages ? 'disabled' : ''}"
                    ${currentPage === pages ? 'disabled' : ''}>
                Next
                <i class="fas fa-chevron-right"></i>
            </button>
        `);
        
        pagination.innerHTML = paginationHTML.join('');
        
        // Add event listeners to pagination buttons
        pagination.querySelectorAll('.page-btn').forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('disabled')) return;
                
                if (button.classList.contains('prev')) {
                    currentPage--;
                } else if (button.classList.contains('next')) {
                    currentPage++;
                } else {
                    currentPage = parseInt(button.dataset.page);
                }
                
                fetchJobs();
            });
        });
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }
    
    // Save job to bookmarks
    async function saveJob(jobId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login.html';
                return;
            }
            
            const response = await fetch(`/api/jobs/${jobId}/save`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to save job');
            }
            
            const button = document.querySelector(`[data-id="${jobId}"] .save-job i`);
            if (button) {
                button.classList.remove('far');
                button.classList.add('fas');
            }
            
            showNotification('Job saved to bookmarks', 'success');
        } catch (error) {
            console.error('Error saving job:', error);
            showNotification(error.message || 'Failed to save job', 'error');
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
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            currentFilters.keyword = searchInput ? searchInput.value.trim() : '';
            currentPage = 1;
            fetchJobs();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentFilters.keyword = e.target.value.trim();
                currentPage = 1;
                fetchJobs();
            }
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            currentFilters.sortBy = sortBy;
            currentFilters.sortOrder = sortOrder;
            currentPage = 1;
            fetchJobs();
        });
    }
    
    // Handle filter changes
    if (filtersSidebar) {
        filtersSidebar.querySelectorAll('input, select').forEach(filter => {
            filter.addEventListener('change', () => {
                currentFilters[filter.name] = filter.value;
                currentPage = 1;
                fetchJobs();
            });
        });
    }
    
    // Load initial jobs
    fetchJobs();
});
