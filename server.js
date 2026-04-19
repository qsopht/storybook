const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Configuration from environment variables
const LLM_CONFIG = {
    provider: process.env.LLM_PROVIDER,
    apiKey: process.env.LLM_API_KEY,
    endpoint: process.env.LLM_ENDPOINT,
    model: process.env.LLM_MODEL || 'claude-haiku-4-5'
};

// Validate required environment variables
if (!LLM_CONFIG.apiKey) {
    console.error('ERROR: LLM_API_KEY environment variable is not set.');
    console.error('Please set the LLM_API_KEY in your .env file or as an environment variable.');
    process.exit(1);
}

if (!LLM_CONFIG.endpoint) {
    console.error('ERROR: LLM_ENDPOINT environment variable is not set.');
    console.error('Please set the LLM_ENDPOINT in your .env file or as an environment variable.');
    process.exit(1);
}

console.log('LLM Configuration loaded successfully');
console.log(`Provider: ${LLM_CONFIG.provider}`);
console.log(`Model: ${LLM_CONFIG.model}`);
console.log(`Endpoint: ${LLM_CONFIG.endpoint}`);


// API endpoint for LLM requests
app.post('/api/continue-story', async (req, res) => {
    try {
        const { story } = req.body;

        if (!story) {
            return res.status(400).json({ error: 'Story is required' });
        }

        const prompt = `You are a creative story writer. Given the following story beginning, generate exactly 3-5 possible next sentences that continue the story naturally. Each sentence should be engaging and move the plot forward.

Story so far: "${story}"

Return ONLY the sentences, one per line, numbered 1 through N. Do not include any explanations or additional text.`;

        const requestBody = {
            model: LLM_CONFIG.model,
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        const headers = {
            'Content-Type': 'application/json',
            'api-key': LLM_CONFIG.apiKey,
            'Ocp-Apim-Subscription-Key': LLM_CONFIG.apiKey,
            'anthropic-version': '2023-06-01'
        };

        // Add subscription key as query parameter as well (some APIM configs require this)
        const url = new URL(LLM_CONFIG.endpoint);
        url.searchParams.append('subscription-key', LLM_CONFIG.apiKey);

        console.log('Sending request to:', url.toString());
        console.log('Headers:', headers);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, response.statusText, errorText);
            return res.status(response.status).json({ 
                error: `API request failed: ${response.statusText}`,
                details: errorText
            });
        }

        const data = await response.json();

        let responseText;
        
        if (LLM_CONFIG.provider === 'openai' || LLM_CONFIG.provider === 'chatgpt') {
            // OpenAI response structure
            responseText = data.choices[0].message.content;
        } else if (LLM_CONFIG.provider === 'anthropic') {
            // Anthropic/Azure response structure
            responseText = data.content[0].text;
        } else {
            return res.status(500).json({ error: `Unsupported provider: ${LLM_CONFIG.provider}` });
        }

        // Parse the numbered sentences from the response
        const sentences = responseText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && /^\d+\./.test(line))
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
        
        return res.json({ options: sentences });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
