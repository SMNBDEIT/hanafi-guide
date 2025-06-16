const openai = require('../config/openai');
const buildPrompt = require('../utils/promptBuilder');

exports.getResponse = async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = buildPrompt(message);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.2,
    });

    res.json({ response: completion.data.choices[0].message.content.trim() });

  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
