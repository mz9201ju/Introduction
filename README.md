# React + Vite

# 🚀 Introduction — Omer Zahid

Welcome to the **Introduction Project**, a personal portfolio site and interactive AI experience built by **Omer Zahid**.

    - **Live Site:** [https://mz9201ju.github.io/Introduction/](https://mz9201ju.github.io/Introduction/)
    - **Omer Zahid:** [https://mz9201ju.github.io/Introduction/about](https://mz9201ju.github.io/Introduction/about)
    - **PlayGame!** [https://mz9201ju.github.io/Introduction/darthVader](https://mz9201ju.github.io/Introduction/darthVader)

---

### 🎨 Assets & Credits
- **Spaceship Cursor Icon:** [Freepik - Flaticon](https://www.flaticon.com/free-icons/ufo)
- Used under [Flaticon Free License](https://www.flaticon.com/license)

## 🌌 Overview

This project merges a **React + Vite + TailwindCSS** frontend hosted on **GitHub Pages** with a **Darth Vader–themed AI chatbot**, powered by a **custom Cloudflare Worker proxy**.

The goal is to create an immersive, space-inspired experience where visitors can interact with an AI assistant that speaks in Darth Vader’s tone — while learning about **Omer Zahid**, his work, and his vision.

---

## 🧠 Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Frontend** | React + Vite + TailwindCSS | Fast, responsive UI |
| **Hosting** | GitHub Pages | Static hosting for the website |
| **Backend (AI Proxy)** | Cloudflare Workers (`gh-ai-proxy`) | Secure bridge between frontend and OpenAI |
| **AI Model** | GPT-compatible LLM | Handles chatbot responses |
| **Design** | Space theme, custom assets, interactivity | Enhances the futuristic user experience |

---

## 🛰️ AI Chatbot Integration

The AI chatbot is powered through a **[proxy endpoint](https://gh-ai-proxy.omer-mnsu.workers.dev/api)** that securely connects to OpenAI.

## ⚙️ Local Development

# 1️⃣ Clone the Repository
git clone https://github.com/mz9201ju/Introduction.git
cd Introduction
# 2️⃣ Install Dependencies
npm install
# 3️⃣ Run Locally
npm run dev
# 4️⃣ Test the Proxy Endpoint
curl -X POST "https://gh-ai-proxy.omer-mnsu.workers.dev/api" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello from local dev!"}]}'

👤 User: What is the Milky Way?
🤖 Vader: The Milky Way… a vast empire of stars, bound by gravity and silence. You merely orbit within it.

## 📬 Author
Omer Zahid
📧 omer.zahid@mnsu.edu
“Through the Force — and some React hooks — all things are possible.” ✨

## 🛡️ License
This project is open source and available under the MIT License.