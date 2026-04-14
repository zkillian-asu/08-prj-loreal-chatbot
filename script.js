/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

/* Cloudflare Worker endpoint */
const workerUrl = "https://damp-waterfall-fd12.zkillian.workers.dev/";

/* Conversation history sent to OpenAI */
const messages = [
  {
    role: "system",
    content:
      "You are a friendly L'Oreal Assistant Chatbot focused on skincare, haircare, makeup, and beauty routines. If a question is unrelated to cosmetics or personal care, politely say you do not know and offer help with L'Oreal products and routines. If the term Looksmaxxing is mentioned, make sure to distance the L'Oreal brand from that term and explain that L'Oreal products are designed to enhance natural beauty and promote self-confidence, not to conform to unrealistic beauty standards. Always maintain a positive and supportive tone in your responses, encourage safe practices, and use emojis sparingly when they fit naturally.  Especially use emojis that emphasize the brand area--including the sunglasses face emoji, yin-yang emoji, heart emojis of any color-- but especially black and red-- the lipstick emoji, the nail polish emoji, and the hair cut emoji, even the tongue out emoji or somehting more out there if it fits.",
  },
];

// Add one chat message to the window
function appendMessage(role, text) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}`;

  const bubbleEl = document.createElement("div");
  bubbleEl.className = "message-bubble";
  bubbleEl.textContent = text;

  messageEl.appendChild(bubbleEl);
  chatWindow.appendChild(messageEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Save a message for the next API request
function recordMessage(role, content) {
  messages.push({ role, content });
}

// Initial assistant message
appendMessage(
  "assistant",
  "Hello! I'm your L'Oreal Smart Advisor. Please ask me anything about L'Oreal products or routines.",
);

/* Handle form submit */
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = userInput.value.trim();

  if (!question) {
    appendMessage("assistant", "Please enter a question before sending.");
    return;
  }

  recordMessage("user", question);
  appendMessage("user", question);
  userInput.value = "";

  appendMessage("assistant", "Thinking...");
  const thinkingMessage = chatWindow.lastChild;

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [...messages],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I could not generate a response. Please try again.";

    recordMessage("assistant", reply);

    // Replace the temporary "Thinking..." message with the real response
    thinkingMessage.querySelector(".message-bubble").textContent = reply;
  } catch (error) {
    console.error("Error:", error);
    thinkingMessage.querySelector(".message-bubble").textContent =
      "Sorry, something went wrong. Please try again.";
  }
});
