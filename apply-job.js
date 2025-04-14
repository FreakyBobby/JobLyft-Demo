document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job');
    
    // If job ID is provided, load job details
    if (jobId) {
        loadJobDetails(jobId);
    }
    
    // File upload handling
    const resumeInput = document.getElementById('resume');
    const fileNameDisplay = document.querySelector('.file-name');
    
    resumeInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileNameDisplay.textContent = this.files[0].name;
        } else {
            fileNameDisplay.textContent = 'No file chosen';
        }
    });
    
    // Form submission
    const applicationForm = document.getElementById('job-application-form');
    
    applicationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Collect form data
        const formData = new FormData(this);
        
        // Add job ID to form data
        formData.append('jobId', jobId);
        
        // Here you would typically send the form data to your server
        // For now, we'll just show a success message
        showApplicationSuccess();
    });
    
    // Save draft functionality
    const saveDraftBtn = document.getElementById('save-draft');
    
    saveDraftBtn.addEventListener('click', function() {
        // Collect form data
        const formData = new FormData(applicationForm);
        
        // Add job ID to form data
        formData.append('jobId', jobId);
        
        // Save to local storage
        saveDraftToLocalStorage(formData);
        
        // Show success message
        showDraftSaved();
    });
    
    // Load draft if exists
    loadDraftFromLocalStorage();
    
    // Function to load job details
    function loadJobDetails(jobId) {
        // In a real application, you would fetch job details from your server
        // For now, we'll use a mock function to simulate this
        const jobDetails = getMockJobDetails(jobId);
        
        if (jobDetails) {
            // Update page title
            document.title = `Apply for ${jobDetails.title} - Joblyft`;
            
            // Update job details in the UI
            document.getElementById('job-title').textContent = jobDetails.title;
            document.getElementById('company-name').textContent = jobDetails.company;
            document.getElementById('job-location').textContent = jobDetails.location;
            document.getElementById('job-type').textContent = jobDetails.type;
            document.getElementById('job-description-text').textContent = jobDetails.description;
            
            // Update requirements
            const requirementsList = document.getElementById('job-requirements-list');
            requirementsList.innerHTML = '';
            
            jobDetails.requirements.forEach(req => {
                const li = document.createElement('li');
                li.textContent = req;
                requirementsList.appendChild(li);
            });
        }
    }
    
    // Function to validate form
    function validateForm() {
        let isValid = true;
        
        // Check required fields
        const requiredFields = applicationForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        // Validate email format
        const emailField = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailField.value && !emailRegex.test(emailField.value)) {
            isValid = false;
            emailField.classList.add('error');
            alert('Please enter a valid email address');
        }
        
        // Validate phone format
        const phoneField = document.getElementById('phone');
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        
        if (phoneField.value && !phoneRegex.test(phoneField.value)) {
            isValid = false;
            phoneField.classList.add('error');
            alert('Please enter a valid phone number');
        }
        
        return isValid;
    }
    
    // Function to show application success message
    function showApplicationSuccess() {
        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>Application Submitted!</h3>
                <p>Your application has been successfully submitted. We'll review it and get back to you soon.</p>
                <a href="job-search.html" class="btn btn-primary">Find More Jobs</a>
            </div>
        `;
        
        // Add styles
        successMessage.style.position = 'fixed';
        successMessage.style.top = '0';
        successMessage.style.left = '0';
        successMessage.style.width = '100%';
        successMessage.style.height = '100%';
        successMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        successMessage.style.display = 'flex';
        successMessage.style.justifyContent = 'center';
        successMessage.style.alignItems = 'center';
        successMessage.style.zIndex = '1000';
        
        // Add to body
        document.body.appendChild(successMessage);
        
        // Add styles for success content
        const successContent = successMessage.querySelector('.success-content');
        successContent.style.backgroundColor = 'white';
        successContent.style.padding = '40px';
        successContent.style.borderRadius = '8px';
        successContent.style.textAlign = 'center';
        successContent.style.maxWidth = '500px';
        successContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        
        // Add styles for icon
        const icon = successMessage.querySelector('i');
        icon.style.fontSize = '60px';
        icon.style.color = '#2ecc71';
        icon.style.marginBottom = '20px';
        
        // Add styles for heading
        const heading = successMessage.querySelector('h3');
        heading.style.fontSize = '24px';
        heading.style.marginBottom = '15px';
        heading.style.color = '#333';
        
        // Add styles for paragraph
        const paragraph = successMessage.querySelector('p');
        paragraph.style.marginBottom = '25px';
        paragraph.style.color = '#666';
        
        // Add styles for button
        const button = successMessage.querySelector('.btn');
        button.style.marginTop = '10px';
    }
    
    // Function to show draft saved message
    function showDraftSaved() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'Draft saved successfully!';
        
        // Add styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#2ecc71';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        notification.style.zIndex = '1000';
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Function to save draft to local storage
    function saveDraftToLocalStorage(formData) {
        // Convert FormData to object
        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });
        
        // Save to local storage
        localStorage.setItem(`jobApplicationDraft_${jobId}`, JSON.stringify(formDataObj));
    }
    
    // Function to load draft from local storage
    function loadDraftFromLocalStorage() {
        if (!jobId) return;
        
        const draftData = localStorage.getItem(`jobApplicationDraft_${jobId}`);
        
        if (draftData) {
            const formDataObj = JSON.parse(draftData);
            
            // Fill form fields
            Object.keys(formDataObj).forEach(key => {
                const field = applicationForm.querySelector(`[name="${key}"]`);
                
                if (field) {
                    if (field.type === 'file') {
                        // Can't set file input value for security reasons
                        const fileNameDisplay = document.querySelector('.file-name');
                        fileNameDisplay.textContent = formDataObj[key] || 'No file chosen';
                    } else {
                        field.value = formDataObj[key];
                    }
                }
            });
        }
    }
    
    // Mock function to get job details
    function getMockJobDetails(jobId) {
        // In a real application, this would be an API call
        // For now, we'll return mock data based on the job ID
        const mockJobs = {
            'software-developer-intern': {
                title: 'Software Developer Intern',
                company: 'Tech Innovations Inc.',
                location: 'San Francisco, CA',
                type: 'Internship',
                description: 'We are looking for a motivated Software Developer Intern to join our team. The ideal candidate will have a strong foundation in computer science and be eager to learn and grow in a fast-paced environment.',
                requirements: [
                    'Currently pursuing a degree in Computer Science or related field',
                    'Knowledge of at least one programming language (Python, Java, JavaScript)',
                    'Strong problem-solving skills',
                    'Excellent communication and teamwork abilities'
                ]
            },
            'marketing-assistant': {
                title: 'Marketing Assistant',
                company: 'Global Marketing Solutions',
                location: 'New York, NY',
                type: 'Part-time',
                description: 'We are seeking a creative and detail-oriented Marketing Assistant to help with our digital marketing campaigns. The ideal candidate will have a passion for marketing and social media.',
                requirements: [
                    'Bachelor\'s degree in Marketing, Communications, or related field',
                    'Experience with social media platforms',
                    'Strong writing and communication skills',
                    'Ability to work in a fast-paced environment'
                ]
            },
            'data-analyst': {
                title: 'Data Analyst',
                company: 'Data Insights Corp',
                location: 'Chicago, IL',
                type: 'Full-time',
                description: 'We are looking for a Data Analyst to help us make sense of our data and drive business decisions. The ideal candidate will have strong analytical skills and experience with data visualization tools.',
                requirements: [
                    'Bachelor\'s degree in Statistics, Mathematics, or related field',
                    'Proficiency in SQL and data visualization tools',
                    'Experience with Python or R for data analysis',
                    'Strong problem-solving and analytical skills'
                ]
            }
        };
        
        return mockJobs[jobId] || null;
    }
}); 