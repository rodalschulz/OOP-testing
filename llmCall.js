// import OpenAI from "openai";

// // "llama-3.1-70b-versatile" | "llama3-70b-8192";
// // "gpt-3.5-turbo" | "gpt-4o-mini";
// // "openAi" | "groq";

const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;
const openAi = new OpenAI({ apiKey: openAiKey, dangerouslyAllowBrowser: true });

export const getAiResponse = async (temperature, messages) => {
  const chatCompletion = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    temperature: temperature,
  });

  const aiResponse = chatCompletion.choices[0]?.message?.content || "";
  return aiResponse;
};
