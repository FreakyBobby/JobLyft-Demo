document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('editJobForm');
    const jobId = new URLSearchParams(window.location.search).get('id');

    if (!jobId) {
        showNotification('No job ID provided', 'error');
        setTimeout(() => {
            window.location.href = 'my-jobs.html';
        }, 2000);
        return;
    }

    // Load job data
    loadJobData(jobId);

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please log in to edit jobs', 'error');
            return;
        }

        const formData = new FormData(form);
        const jobData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(jobData)
            });

            if (!response.ok) {
                throw new Error('Failed to update job');
            }

            showNotification('Job updated successfully', 'success');
            setTimeout(() => {
                window.location.href = 'my-jobs.html';
            }, 2000);
        } catch (error) {
            console.error('Error updating job:', error);
            showNotification('Failed to update job', 'error');
        }
    });
});

async function loadJobData(jobId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in to edit jobs', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load job data');
        }

        const job = await response.json();
        
        // Populate form fields
        for (const [key, value] of Object.entries(job)) {
            const input = document.getElementById(key);
            if (input) {
                input.value = value;
            }
        }
    } catch (error) {
        console.error('Error loading job data:', error);
        showNotification('Failed to load job data', 'error');
    }
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