import { Client, GatewayIntentBits } from "discord.js";
import OpenAI from "openai";

// Debug: kiểm tra token và key
console.log("🔑 DISCORD_TOKEN tồn tại?", !!process.env.DISCORD_TOKEN);
console.log("🔑 OPENROUTER_API_KEY tồn tại?", !!process.env.OPENROUTER_API_KEY);

// Khởi tạo Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Kết nối OpenRouter (dùng như OpenAI nhưng khác baseURL)
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Khi bot online
client.on("ready", () => {
  console.log(`✅ Bot đã đăng nhập: ${client.user.tag}`);
});

// Khi có tin nhắn
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!ask")) {
    const prompt = message.content.replace("!ask", "").trim();

    if (!prompt) {
      return message.reply("👉 Hãy nhập câu hỏi sau `!ask`");
    }

    try {
      const response = await openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo", // có thể đổi sang "openai/gpt-4" hoặc "anthropic/claude-3-haiku"
        messages: [{ role: "user", content: prompt }],
      });

      const reply = response.choices[0].message.content;
      message.reply(reply);
    } catch (err) {
      console.error("❌ Lỗi khi gọi OpenRouter:");
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      } else {
        console.error(err.message);
      }
      message.reply("⚠️ Có lỗi khi gọi ChatGPT (OpenRouter)!");
    }
  }
});

// Đăng nhập bot
client.login(process.env.DISCORD_TOKEN);
