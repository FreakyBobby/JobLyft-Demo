document.addEventListener('DOMContentLoaded', async () => {
    // DOM elements
    const form = document.getElementById('postJobForm');
    const submitBtn = document.getElementById('submit-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const successMessage = document.querySelector('.success-message');
    
    // Validate form
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            const errorMessage = field.nextElementSibling;
            if (!field.value.trim()) {
                field.classList.add('error');
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.style.display = 'block';
                }
                isValid = false;
            } else {
                field.classList.remove('error');
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.style.display = 'none';
                }
            }
        });
        
        // Validate salary range
        const salaryMin = parseInt(document.getElementById('salaryMin').value);
        const salaryMax = parseInt(document.getElementById('salaryMax').value);
        
        if (salaryMin && salaryMax && salaryMin > salaryMax) {
            const salaryError = document.getElementById('salaryMax').nextElementSibling;
            if (salaryError) {
                salaryError.style.display = 'block';
                salaryError.textContent = 'Maximum salary must be greater than minimum salary';
            }
            isValid = false;
        }
        
        return isValid;
    }
    
    // Save form data as draft
    function saveDraft() {
        const formData = new FormData(form);
        const draftData = {};
        
        formData.forEach((value, key) => {
            draftData[key] = value;
        });
        
        localStorage.setItem('jobDraft', JSON.stringify(draftData));
        showNotification('Draft saved successfully!', 'success');
    }
    
    // Load draft data
    function loadDraft() {
        const draftData = JSON.parse(localStorage.getItem('jobDraft'));
        if (draftData) {
            Object.keys(draftData).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = draftData[key];
                }
            });
            showNotification('Draft loaded successfully!', 'success');
        }
    }
    
    // Submit form
    async function submitForm(formData) {
        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting Job...';
            }
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login.html';
                return;
            }
            
            // Prepare job data
            const jobData = {
                title: formData.get('jobTitle'),
                company: formData.get('companyName'),
                location: formData.get('location'),
                jobType: formData.get('jobType'),
                industry: formData.get('industry') || '',
                salaryRange: `$${formData.get('salaryMin')}-$${formData.get('salaryMax')} ${formData.get('salaryType')}`,
                description: formData.get('description'),
                qualifications: formData.get('qualifications'),
                contactEmail: formData.get('contactEmail') || '',
                benefits: formData.get('benefits') || ''
            };
            
            // Send job posting request to backend
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(jobData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to post job');
            }
            
            // Show success message and clear form
            form.reset();
            localStorage.removeItem('jobDraft');
            
            if (successMessage) {
                successMessage.style.display = 'flex';
                form.style.display = 'none';
            }
            
            showNotification('Job posted successfully!', 'success');
            
            // Redirect to job listings after a delay
            setTimeout(() => {
                window.location.href = '/job-search.html';
            }, 2000);
        } catch (error) {
            console.error('Error posting job:', error);
            showNotification(error.message || 'Failed to post job', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Post Job';
            }
        }
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Add event listeners
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                showNotification('Please fill in all required fields correctly', 'error');
                return;
            }
            
            const formData = new FormData(form);
            await submitForm(formData);
        });
        
        // Save draft button
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                saveDraft();
            });
        }
        
        // Load draft if exists
        loadDraft();
        
        // Add input event listeners for real-time validation
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => {
                if (field.hasAttribute('required')) {
                    const errorMessage = field.nextElementSibling;
                    if (!field.value.trim()) {
                        field.classList.add('error');
                        if (errorMessage && errorMessage.classList.contains('error-message')) {
                            errorMessage.style.display = 'block';
                        }
                    } else {
                        field.classList.remove('error');
                        if (errorMessage && errorMessage.classList.contains('error-message')) {
                            errorMessage.style.display = 'none';
                        }
                    }
                }
            });
        });
    } else {
        console.error('Post job form not found in the DOM');
    }
});
