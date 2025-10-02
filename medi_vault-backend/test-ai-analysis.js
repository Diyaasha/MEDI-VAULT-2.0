const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Test medical report analysis
async function testMedicalAnalysis() {
    const sampleBloodReport = `
    Patient: John Doe
    Date: 2024-01-15
    BLOOD TEST REPORT
    
    Hemoglobin: 14.2 g/dl
    White Blood Cells: 6800 /cmm
    Red Blood Cells: 4.5 mil/cmm
    Platelets: 250000 /cmm
    Glucose: 95 mg/dl
    Cholesterol: 180 mg/dl
    `;

    const prompt = `You are a medical AI assistant. Analyze this medical report and provide:

1. SIMPLE SUMMARY: Explain the medical report in easy-to-understand language that any patient can understand
2. KEY FINDINGS: List the most important results and what they mean
3. ACTIONABLE SUGGESTIONS: Provide 3-5 specific recommendations for the patient based on the results
4. FOLLOW-UP: Suggest when to see a doctor or get retested if needed

Medical Report:\n${sampleBloodReport}

Format your response as JSON with keys: summary, keyFindings, suggestions, followUp`;

    try {
        console.log('🧠 Testing Gemini AI medical analysis...');
        console.log('Model:', 'gemini-2.5-flash');
        console.log('API Key found:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();
        
        console.log('\n✅ Gemini API Response:');
        console.log('Response length:', content.length, 'characters');
        console.log('Raw response:', content);
        
        // Try to parse as JSON (handle markdown wrapped JSON)
        try {
            // Remove markdown code block markers if present
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
            }
            
            const parsedResponse = JSON.parse(cleanContent.trim());
            console.log('\n✅ Successfully parsed JSON:');
            console.log('Summary:', parsedResponse.summary);
            console.log('Key Findings:', parsedResponse.keyFindings);
            console.log('Suggestions:', parsedResponse.suggestions);
            console.log('Follow-up:', parsedResponse.followUp);
            
            return parsedResponse;
        } catch (parseError) {
            console.log('\n⚠️  Could not parse as JSON, but got response:', parseError.message);
            return content;
        }
        
    } catch (error) {
        console.error('❌ Error testing Gemini API:', error.message);
        if (error.message.includes('404')) {
            console.log('Model not found - check model name');
        } else if (error.message.includes('quota')) {
            console.log('API quota exceeded');
        } else if (error.message.includes('key')) {
            console.log('API key issue');
        }
        throw error;
    }
}

// Run the test
testMedicalAnalysis().catch(console.error);