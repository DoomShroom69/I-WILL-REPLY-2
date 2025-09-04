import { Client, GatewayIntentBits } from "discord.js";
import OpenAI from "openai";

// Debug: kiểm tra secrets
console.log("🔑 DISCORD_TOKEN tồn tại?", !!process.env.DISCORD_TOKEN);
console.log("🔑 OPENAI_API_KEY tồn tại?", !!process.env.OPENAI_API_KEY);

// Khởi tạo Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

// Kết nối OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
        model: "gpt-4o-mini", // hoặc "gpt-3.5-turbo" nếu bạn muốn
        messages: [{ role: "user", content: prompt }],
      });

      const reply = response.choices[0].message.content;
      message.reply(reply);
    } catch (err) {
      console.error("❌ Lỗi khi gọi OpenAI:");
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      } else {
        console.error(err.message);
      }
      message.reply("⚠️ There was an error calling I WILL REPLY!");
    }
  }
});

// Đăng nhập bot
client.login(process.env.DISCORD_TOKEN);
