
import dotenv from 'dotenv';
dotenv.config();

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

        console.log('Available Models:');
        if (data.models) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.models.forEach((m: any) => {
                if (m.name.includes('embedding')) {
                    console.log(`- ${m.name} (Supported methods: ${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log('No models found (data.models is empty)');
        }

    } catch (error) {
        console.error('Network error:', error);
    }
}

listModels();
