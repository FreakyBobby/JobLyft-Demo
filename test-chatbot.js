const fetch = require('node-fetch');
const ChatbotLLM = require('./chatbot-llm');
const chatbot = new ChatbotLLM();

const testQuestions = [
    // Job-related questions
    "What jobs are available?",
    "Tell me about the current job openings",
    "How many full-time positions do you have?",
    
    // Company-related questions
    "Which companies are hiring?",
    "How many companies are on the platform?",
    "What are the top employers?",
    
    // Salary-related questions
    "What's the average salary range?",
    "How much do jobs pay?",
    "What's the typical compensation?",
    
    // Location-related questions
    "Where are the jobs located?",
    "Which cities have the most opportunities?",
    "What are the top job locations?",
    
    // Skills-related questions
    "What skills are in demand?",
    "What qualifications do I need?",
    "What are the most required skills?",
    
    // Application-related questions
    "How do I apply for jobs?",
    "What's the application process?",
    "How many applications have been submitted?"
];

async function testChatbot() {
    console.log('Starting chatbot tests...\n');
    
    for (const question of testQuestions) {
        try {
            console.log(`\nTesting question: "${question}"`);
            console.log('-'.repeat(50));
            
            const response = await fetch('http://localhost:3000/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: question })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('Response:', data.response);
                console.log('Category:', await chatbot.queryDatabase(question));
            } else {
                console.error('Error:', data.error);
            }
            
            // Add a small delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error('Test failed:', error.message);
        }
    }
    
    console.log('\nAll tests completed!');
}

// Run the tests
testChatbot().catch(console.error); 