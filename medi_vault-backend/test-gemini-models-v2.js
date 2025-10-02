const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');
require('dotenv').config();

async function testGeminiAPI() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('Using API Key:', apiKey ? 'Found' : 'NOT FOUND');
    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
    
    // Method 1: Try direct REST API call to list models
    console.log('\n=== Method 1: Direct REST API Call ===');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Available models from REST API:');
            
            if (data.models && data.models.length > 0) {
                data.models.forEach((model, index) => {
                    console.log(`${index + 1}. ${model.name}`);
                    console.log(`   Display Name: ${model.displayName || 'N/A'}`);
                    console.log(`   Description: ${model.description || 'No description'}`);
                    console.log(`   Supported Methods: ${model.supportedGenerationMethods ? model.supportedGenerationMethods.join(', ') : 'N/A'}`);
                    console.log('---');
                });
            } else {
                console.log('No models found in response');
            }
        } else {
            console.log('REST API Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('Error details:', errorText);
        }
    } catch (error) {
        console.log('REST API fetch error:', error.message);
    }
    
    // Method 2: Try with different API versions
    console.log('\n=== Method 2: Try Different API Versions ===');
    const versions = ['v1', 'v1beta'];
    
    for (const version of versions) {
        try {
            console.log(`\nTrying API version: ${version}`);
            const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${version} - Success! Found ${data.models ? data.models.length : 0} models`);
                
                // Try to find a working model with generateContent
                if (data.models) {
                    for (const model of data.models.slice(0, 3)) { // Test first 3 models
                        if (model.supportedGenerationMethods && 
                            model.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`  Testing model: ${model.name}`);
                            
                            try {
                                const genAI = new GoogleGenerativeAI(apiKey);
                                const testModel = genAI.getGenerativeModel({ model: model.name.replace('models/', '') });
                                
                                const result = await testModel.generateContent('Say hello');
                                const response = await result.response;
                                const text = response.text();
                                
                                console.log(`  ✅ ${model.name} WORKS! Response: ${text.substring(0, 30)}...`);
                                return model.name; // Found working model
                            } catch (testError) {
                                console.log(`  ❌ ${model.name} - Error: ${testError.message.substring(0, 100)}...`);
                            }
                        }
                    }
                }
            } else {
                console.log(`❌ ${version} - Error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ ${version} - Fetch error: ${error.message}`);
        }
    }
    
    // Method 3: Check if it's a quota/permissions issue
    console.log('\n=== Method 3: Check API Key Permissions ===');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            
            if (errorText.includes('API_KEY_INVALID')) {
                console.log('🔑 Issue: API key is invalid');
            } else if (errorText.includes('quota')) {
                console.log('💰 Issue: API quota exceeded');
            } else if (errorText.includes('permission')) {
                console.log('🚫 Issue: API key lacks permissions');
            }
        }
    } catch (error) {
        console.log('Permission check error:', error.message);
    }
}

testGeminiAPI().catch(console.error);