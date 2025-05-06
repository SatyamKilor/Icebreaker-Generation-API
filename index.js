const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// To authenticate with the model you will need to generate a personal access token (PAT) in your GitHub settings. 
const token = process.env.GITHUB_TOKEN;

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token
});

app.use(express.json()); // To parse JSON request bodies

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: `
You are a helpful, intelligent writing assistant. Your job is to take as input bunch of personal information about a prospect, and then design a customized, one-line email ice breaker to begin the conversation and to imply that the rest of my conversation is personalized. 

You'll return the icebreaker in JSON using this format:
{"icebreaker":"Hey {name,\n\n Really respect X and love that you're doing Y. Wanted to run something by you. }"}

Here is a bunch of information about me so that you can make these icebreakers more personalized. I am an expert at Web designing and Building AI automation solutions. I help business to integrate AI solutions in their business which solve a pain point/problem or saves time. Also I am good at building clean and professional looking websites.

Rules:
- Write in a Spartan/laconic tone of voice
- Weave in context with my own personal information wherever possible
- Keep things very short and follow the provided format.
- Imply familiarity wherever possible - i.e. if you see an opportunity to imply that I like the same things, believe the same things, or want the same things as they do, go for it.` },
        { role: "user", content: userMessage }
      ],
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 4096,
      top_p: 1
    });

    // Send the model's response back
    res.json({ response: response.choices[0].message.content });
  } catch (err) {
    console.error("Error during API call:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
