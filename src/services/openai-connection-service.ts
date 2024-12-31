import { OpenAI } from 'openai';

const openai = new OpenAI({
  organization: process.env.OPENAI_ORGANIZATION,
  project: process.env.OPENAI_PROJECT,
});

const createCompletion = async (prompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
    });
    return completion.choices[0];
  } catch (error) {
    console.error('Error creating completion:', error);
  }
};

export { createCompletion };
