document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('postJobForm');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const loadDraftBtn = document.getElementById('loadDraftBtn');

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please log in to post jobs', 'error');
            return;
        }

        const formData = new FormData(form);
        const jobData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(jobData)
            });

            if (!response.ok) {
                throw new Error('Failed to post job');
            }

            showNotification('Job posted successfully', 'success');
            setTimeout(() => {
                window.location.href = 'my-jobs.html';
            }, 2000);
        } catch (error) {
            console.error('Error posting job:', error);
            showNotification('Failed to post job', 'error');
        }
    });

    // Handle save draft
    saveDraftBtn.addEventListener('click', function() {
        const formData = new FormData(form);
        const jobData = Object.fromEntries(formData.entries());
        localStorage.setItem('jobDraft', JSON.stringify(jobData));
        showNotification('Draft saved successfully', 'success');
    });

    // Handle load draft
    loadDraftBtn.addEventListener('click', function() {
        const draft = localStorage.getItem('jobDraft');
        if (!draft) {
            showNotification('No draft found', 'error');
            return;
        }

        const jobData = JSON.parse(draft);
        for (const [key, value] of Object.entries(jobData)) {
            const input = document.getElementById(key);
            if (input) {
                input.value = value;
            }
        }
        showNotification('Draft loaded successfully', 'success');
    });
});

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