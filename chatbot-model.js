// Import TensorFlow.js
const tf = require('@tensorflow/tfjs-node');

class ChatbotModel {
    constructor() {
        this.model = null;
        this.categories = [
            'jobs',
            'companies',
            'salary',
            'location',
            'skills',
            'application',
            'general'
        ];
        this.initializeModel();
    }

    async initializeModel() {
        // Create a simple model
        this.model = tf.sequential();
        
        // Add layers
        this.model.add(tf.layers.embedding({
            inputDim: 1000,  // Vocabulary size
            outputDim: 16,   // Embedding dimension
            inputLength: 10  // Max sequence length
        }));
        
        this.model.add(tf.layers.globalAveragePooling1d({}));
        this.model.add(tf.layers.dense({
            units: 24,
            activation: 'relu'
        }));
        this.model.add(tf.layers.dense({
            units: this.categories.length,
            activation: 'softmax'
        }));

        // Compile the model
        this.model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        // Load pre-trained weights if available
        try {
            await this.model.loadWeights('file://./chatbot-model-weights.json');
            console.log('Loaded pre-trained model weights');
        } catch (error) {
            console.log('No pre-trained weights found, using fresh model');
        }
    }

    preprocessText(text) {
        // Simple text preprocessing
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')  // Remove punctuation
            .split(/\s+/)             // Split into words
            .slice(0, 10)            // Take first 10 words
            .join(' ');
    }

    async predict(text) {
        if (!this.model) {
            throw new Error('Model not initialized');
        }

        // Preprocess the input text
        const processedText = this.preprocessText(text);
        
        // Convert text to tensor
        const inputTensor = tf.tensor2d([this.textToSequence(processedText)]);
        
        // Make prediction
        const prediction = await this.model.predict(inputTensor).data();
        
        // Get the category with highest probability
        const maxIndex = prediction.indexOf(Math.max(...prediction));
        
        return {
            category: this.categories[maxIndex],
            confidence: prediction[maxIndex]
        };
    }

    textToSequence(text) {
        // Simple word to number mapping
        const wordMap = {
            'job': 1, 'jobs': 1, 'position': 1, 'work': 1, 'career': 1,
            'company': 2, 'employer': 2, 'business': 2, 'organization': 2,
            'salary': 3, 'pay': 3, 'compensation': 3, 'income': 3, 'money': 3,
            'location': 4, 'where': 4, 'place': 4, 'city': 4, 'area': 4,
            'skill': 5, 'skills': 5, 'requirement': 5, 'qualification': 5, 'experience': 5,
            'apply': 6, 'application': 6, 'submit': 6, 'resume': 6, 'cv': 6
        };

        // Convert text to sequence of numbers
        return text.split(' ').map(word => wordMap[word] || 0);
    }

    async train(trainingData) {
        // Prepare training data
        const xs = tf.tensor2d(trainingData.map(item => this.textToSequence(item.text)));
        const ys = tf.tensor2d(trainingData.map(item => this.categories.map(cat => 
            cat === item.category ? 1 : 0
        )));

        // Train the model
        await this.model.fit(xs, ys, {
            epochs: 10,
            batchSize: 32,
            validationSplit: 0.2
        });

        // Save the weights
        await this.model.saveWeights('file://./chatbot-model-weights.json');
    }
}

module.exports = ChatbotModel; 