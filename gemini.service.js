const {GoogleGenerativeAI} = require("@google/generative-ai");
const {FSDB} = require("file-system-db");
const genAI = new GoogleGenerativeAI(SECRET_API_KEY);
const model = genAI.getGenerativeModel({model : "gemini-1.5-pro"});

async function ask(chatId, message, imgData) {
  try {
    const db = new FSDB(`./db/${chatId}.json`, false);
    const history = db.get("history") || [];

    const newMessage = {
      role: "user",
      parts: [],
    };
    if (message) {
      newMessage.parts.push({ text : message });
    }
    if (imgData) {
      newMessage.parts.push({
        inlineData: {
          data:imgData.imageBase64,
          mimeType:imgData.mimetype
        },
      });
    }

    history.push(newMessage);

    const chat = model.startChat({
      history: history.slice(),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
    const result = await chat.sendMessage(newMessage.parts);
    const response = await result.response;
    const text = response.text();
    history.push({
      role: "model",
      parts: [{text}],
    });
    db.set("history", history);
    return text;
  } catch (error) {
    console.error(error);
    return error.message || "An error occurred";
  }
}

module.exports = { ask };