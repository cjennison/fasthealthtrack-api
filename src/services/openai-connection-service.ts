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

const moderateContent = async (content: string): Promise<boolean> => {
  try {
    const completion = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: content,
    });
    if (!completion.results || completion.results.length === 0) {
      console.error('Error creating moderation:', completion);
      throw new Error('Error creating moderation');
    } else {
      // If the content is flagged, log the results to console.log
      if (completion.results[0].flagged === true) {
        console.log('Content flagged:', completion.results);
      }
      return completion.results[0].flagged === false;
    }
  } catch (error) {
    console.error('Error creating completion:', error);
    throw new Error('Error creating moderation');
  }
};

const contentPassesModeration = async (content: string): Promise<boolean> => {
  try {
    const moderationResult = await moderateContent(content);
    return moderationResult;
  } catch (error) {
    console.error('Error moderating content:', error);
    throw new Error('Error moderating content');
  }
};

export { createCompletion, moderateContent, contentPassesModeration };
