document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return;
  
    const matchContainer = document.getElementById("matches-container");
    const chatForm = document.getElementById("chat-form");
    const chatBox = document.getElementById("chat-box");
  
    fetch("/matches/" + user.email)
      .then(res => res.json())
      .then(matches => {
        matchContainer.innerHTML = "";
  
        if (!matches.length) {
          matchContainer.innerHTML = "<p class='no-matches'>No matches yet.</p>";
        } else {
          matches.forEach(match => {
            const button = document.createElement("button");
            button.className = "match-button";
            button.textContent = match.profile.name;
            button.dataset.id = match.id;
            button.addEventListener("click", () => openChat(match));
            matchContainer.appendChild(button);
          });
        }
  
        chatBox.classList.remove("hidden");
      });
  
    chatForm.addEventListener("submit", sendMessage);
  });
  
  let currentMatch = null;
  
  function openChat(match) {
    const chatBox = document.getElementById("chat-box");
    const chatHeader = document.getElementById("chat-header");
    const chatMessages = document.getElementById("chat-messages");
  
    currentMatch = match;
    chatHeader.textContent = "Chatting with " + match.profile.name;
    chatMessages.innerHTML = "";
  
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
  
    fetch(`/messages/${user.id}/${match.id}`)
      .then(res => res.json())
      .then(messages => {
        messages.forEach(m => {
          const msgEl = document.createElement("div");
          msgEl.textContent = `${m.from === user.id ? "You" : match.profile.name}: ${m.content}`;
          chatMessages.appendChild(msgEl);
        });
  
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
  }
  
  function sendMessage(e) {
    e.preventDefault();
  
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message || !currentMatch) return;
  
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
  
    fetch("/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromId: user.id,
        toId: currentMatch.id,
        content: message
      })
    }).then(() => {
      const chatMessages = document.getElementById("chat-messages");
      const msgEl = document.createElement("div");
      msgEl.textContent = `You: ${message}`;
      chatMessages.appendChild(msgEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      input.value = "";
    });
  }