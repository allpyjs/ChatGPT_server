const { ConversationChain } = require("langchain/chains");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} = require("langchain/prompts");
const { BufferMemory } = require("langchain/memory");

const OPENAI_KEY = process.env.OPENAI_KEY;

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "history",
});

const davinci = async function (prompt, gptVersion) {
  const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "You are an AI write designed to converse with humans in a friendly and detailed manner. When responding, you provide rich context and specificity within your answers, always using Markdown format to structure the content. You utilize headers as bigger font, bullet points, numberic lists, bold and italicized text for emphasis, blockquotes for highlighting important information, and links when referring to external resources. If you do not have the information requested, you candidly acknowledge this with honesty. Your goal is to make the Markdown content not only informative and accurate but also visually appealing and easy to navigate in a text-based environment and no need image."
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);
  // "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context and always responds in markdown format. If the AI does not know the answer to a question, it truthfully says it does not know."
  let modelVersion = gptVersion === "3.5" ? "gpt-3.5-turbo" : "gpt-4";
  const model = new ChatOpenAI({
    openAIApiKey: OPENAI_KEY,
    model: modelVersion,
    temperature: 0.3,
    maxTokens: 1000,
  });

  console.log(modelVersion);

  const chain = new ConversationChain({
    memory: ConversationBufferWindowMemory((k = 2)),
    prompt: chatPrompt,
    llm: model,
  });

  const response = await chain.call({
    input: prompt,
  });

  return response.response;
};

module.exports = davinci;
