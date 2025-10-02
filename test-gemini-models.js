const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listGeminiModels() {
    try {
        console.log('Using API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try to list models
        console.log('Attempting to list available models...');
        
        // Try different approaches to get models
        try {
            const models = await genAI.listModels();
            console.log('Available models:');
            models.forEach((model, index) => {
                console.log(`${index + 1}. ${model.name}`);
                console.log(`   Display Name: ${model.displayName}`);
                console.log(`   Description: ${model.description || 'No description'}`);
                console.log('---');
            });
        } catch (listError) {
            console.log('listModels() failed:', listError.message);
            
            // Try some common model names directly
            const commonModels = [
                'gemini-pro',
                'gemini-1.5-pro',
                'gemini-1.5-flash',
                'gemini-1.0-pro',
                'models/gemini-pro',
                'models/gemini-1.5-pro',
                'models/gemini-1.5-flash',
                'models/gemini-1.0-pro'
            ];
            
            console.log('\nTrying common model names directly...');
            
            for (const modelName of commonModels) {
                try {
                    console.log(`Testing model: ${modelName}`);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    
                    // Try a simple generation to test if model exists
                    const result = await model.generateContent('Hello');
                    const response = await result.response;
                    const text = response.text();
                    
                    console.log(`✅ ${modelName} - WORKS! Response: ${text.substring(0, 50)}...`);
                    break; // Found a working model
                    
                } catch (modelError) {
                    console.log(`❌ ${modelName} - Error: ${modelError.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('Error testing Gemini API:', error);
        
        // Check if it's an API key issue
        if (error.message.includes('API_KEY')) {
            console.log('\n🔑 API Key Issue: Make sure GEMINI_API_KEY is set correctly in .env file');
        } else if (error.message.includes('quota')) {
            console.log('\n💰 Quota Issue: You may have exceeded your API quota');
        } else if (error.message.includes('permission')) {
            console.log('\n🚫 Permission Issue: Your API key may not have the right permissions');
        }
    }
}

// Run the test
listGeminiModels();