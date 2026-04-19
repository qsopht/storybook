# Storybook - Word Similarity Lookup

A web application that finds similar words using an LLM.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

## How it works

- The client-side JavaScript makes requests to the local server endpoint
- The server handles all API calls to the LLM
- This avoids CORS issues that occur when calling external APIs directly from the browser

## API Configuration

The server configuration is in `server.js`. You can update the API key and endpoint there:

```javascript
const LLM_CONFIG = {
    provider: 'anthropic',
    apiKey: 'YOUR_API_KEY_HERE',
    endpoint: 'YOUR_API_ENDPOINT',
    model: 'claude-haiku-4-5'
};
```

## Features

- Enter a single word to find similar words
- Click any result to search for similar words to that word
- Clean, responsive Bootstrap UI
- Server-side API handling for CORS compliance
