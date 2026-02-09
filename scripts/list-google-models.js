/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

console.log('API Key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'Found' : 'Missing');

async function listModels() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    console.error('No API Key found!');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
        console.error('Error fetching models:', data.error);
        return;
    }

    if (data.models) {
        console.log('Available Models:');
        data.models.forEach((m) => {
            console.log(`- ${m.name} (methods: ${m.supportedGenerationMethods})`);
        });
    } else {
        console.log('No models found (data.models is empty)');
    }

  } catch (error) {
    console.error('Network error:', error);
  }
}

listModels();
