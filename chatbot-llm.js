class ChatbotLLM {
    constructor() {
        this.patterns = {
            jobs: [
                /^what jobs/i,
                /^show jobs/i,
                /^list jobs/i,
                /^available jobs/i,
                /^current openings/i,
                /^job openings/i,
                /^full.?time/i,
                /^part.?time/i,
                /^internship/i
            ],
            companies: [
                /^which companies/i,
                /^who is hiring/i,
                /^top employers/i,
                /^companies hiring/i,
                /^employers/i,
                /^how many companies/i
            ],
            salary: [
                /^salary/i,
                /^pay/i,
                /^compensation/i,
                /^how much/i,
                /^what's the pay/i,
                /^typical compensation/i,
                /^wage/i
            ],
            location: [
                /^where are the jobs/i,
                /^job locations/i,
                /^cities/i,
                /^remote/i,
                /^onsite/i,
                /^location/i,
                /^which cities/i,
                /^top locations/i
            ],
            skills: [
                /^skills/i,
                /^requirements/i,
                /^qualifications/i,
                /^what do i need/i,
                /^what's needed/i,
                /^in demand/i,
                /^required skills/i
            ],
            application: [
                /^how to apply/i,
                /^application process/i,
                /^apply for jobs/i,
                /^submitting/i,
                /^submission/i,
                /^how do i apply/i,
                /^application steps/i
            ]
        };
    }

    async queryDatabase(message) {
        // Convert message to lowercase for case-insensitive matching
        const lowerMessage = message.toLowerCase().trim();
        
        // Check for exact matches first
        for (const [category, patterns] of Object.entries(this.patterns)) {
            if (patterns.some(pattern => pattern.test(lowerMessage))) {
                return category;
            }
        }
        
        // If no exact match, check for partial matches with priority
        const partialMatches = {
            jobs: ['job', 'position', 'opening', 'vacancy', 'hiring'],
            companies: ['company', 'employer', 'organization'],
            salary: ['salary', 'pay', 'compensation', 'wage'],
            location: ['location', 'where', 'city', 'place'],
            skills: ['skill', 'requirement', 'qualification'],
            application: ['apply', 'application', 'submit']
        };

        // Count matches for each category
        const matchCounts = {};
        for (const [category, keywords] of Object.entries(partialMatches)) {
            matchCounts[category] = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
        }

        // Return the category with the most matches, or 'general' if no matches
        const maxMatches = Math.max(...Object.values(matchCounts));
        if (maxMatches > 0) {
            return Object.entries(matchCounts).find(([_, count]) => count === maxMatches)[0];
        }
        
        return 'general';
    }

    async processMessage(message) {
        const category = await this.queryDatabase(message);
        
        const responses = {
            jobs: "I can help you find job opportunities. We have various positions available across different industries.",
            companies: "We work with many reputable companies that are actively hiring. Let me show you the current opportunities.",
            salary: "Our job listings include competitive salary ranges. The compensation varies based on the role and experience level.",
            location: "We have job opportunities in various locations. Many positions offer remote work options as well.",
            skills: "Different roles require different skill sets. I can help you understand the qualifications needed for specific positions.",
            application: "To apply for a job, you'll need to create an account, upload your resume, and complete the application form for the position you're interested in.",
            general: "I can help you with information about jobs, companies, salaries, locations, skills, and the application process. What would you like to know?"
        };

        return responses[category];
    }
}

module.exports = ChatbotLLM; 