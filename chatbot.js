class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.initializeChatbot();
        this.setupEventListeners();
    }

    initializeChatbot() {
        // Create chatbot container
        const container = document.createElement('div');
        container.className = 'chatbot-container';
        container.innerHTML = `
            <button class="chatbot-button">
                <i class="fas fa-comments"></i>
            </button>
            <div class="chatbot-window">
                <div class="chatbot-header">
                    <h3>JobLyft Assistant</h3>
                    <button class="close-chatbot">&times;</button>
                </div>
                <div class="chatbot-messages"></div>
                <div class="chatbot-input">
                    <input type="text" placeholder="Type your message...">
                    <button>Send</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Add Font Awesome for icons
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);

        // Store references to elements
        this.button = container.querySelector('.chatbot-button');
        this.window = container.querySelector('.chatbot-window');
        this.messagesContainer = container.querySelector('.chatbot-messages');
        this.input = container.querySelector('.chatbot-input input');
        this.sendButton = container.querySelector('.chatbot-input button');
        this.closeButton = container.querySelector('.close-chatbot');

        // Add welcome message
        this.addBotMessage("Hello! I'm your JobLyft assistant. I can help you with information about jobs, companies, salaries, locations, skills, and the application process. What would you like to know?");
    }

    setupEventListeners() {
        this.button.addEventListener('click', () => this.toggleChatbot());
        this.closeButton.addEventListener('click', () => this.toggleChatbot());
        this.sendButton.addEventListener('click', () => this.handleUserMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserMessage();
            }
        });
    }

    toggleChatbot() {
        this.isOpen = !this.isOpen;
        this.window.style.display = this.isOpen ? 'flex' : 'none';
    }

    addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageElement.textContent = message;
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addUserMessage(message) {
        this.addMessage(message, true);
    }

    addBotMessage(message) {
        this.addMessage(message, false);
    }

    async handleUserMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.addUserMessage(message);
        this.input.value = '';

        try {
            // Show loading state
            const loadingMessage = 'Thinking...';
            this.addBotMessage(loadingMessage);

            // Call the backend API
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();

            // Remove loading message
            this.messagesContainer.removeChild(this.messagesContainer.lastChild);

            // Add the actual response
            this.addBotMessage(data.response);
        } catch (error) {
            console.error('Error:', error);
            // Remove loading message
            this.messagesContainer.removeChild(this.messagesContainer.lastChild);
            this.addBotMessage("I'm sorry, I encountered an error. Please try again later.");
        }
    }
}

// Initialize chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
}); 