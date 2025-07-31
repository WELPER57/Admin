// script.js

const socket = io("wss://chat-backend.up.railway.app");

// Elemen-elemen
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const chatBox = document.getElementById("chat-box");
const fileInput = document.getElementById("image-input");

// Kirim pesan
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (message !== "") {
    socket.emit("message", message);
    input.value = "";
  }
});

// Kirim gambar
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    socket.emit("image", reader.result); // Kirim base64
  };
  reader.readAsDataURL(file);
});

// Terima pesan
socket.on("message", (data) => {
  const div = document.createElement("div");
  div.classList.add("chat-message");
  div.innerText = data;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Terima gambar
socket.on("image", (base64) => {
  const img = document.createElement("img");
  img.src = base64;
  img.classList.add("chat-image");
  chatBox.appendChild(img);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ==== Untuk USER ====
const messageInput = document.getElementById('message-input');
const chatBox = document.getElementById('chat-box');
const fileInput = document.getElementById('file-input');

let userId = localStorage.getItem('userId') || 'buyer-' + Math.random().toString(36).substring(7);
localStorage.setItem('userId', userId);

function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit('user-message', { userId, message: msg });
    appendMessage('Kamu', msg);
    messageInput.value = '';
  }
}

fileInput?.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('user-message', { userId, image: reader.result });
      appendImage('Kamu', reader.result);
    };
    reader.readAsDataURL(file);
  }
});

socket.on('admin-reply', (data) => {
  if (data.userId === userId) {
    if (data.image) appendImage('Admin', data.image);
    else appendMessage('Admin', data.message);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendImage(sender, imgSrc) {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.innerHTML = `<strong>${sender}:</strong><br><img src="${imgSrc}" alt="image" />`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ==== Untuk ADMIN ====
const adminInput = document.getElementById('admin-message-input');
const adminBox = document.getElementById('admin-chat-box');
const userList = document.getElementById('user-list');
const adminFileInput = document.getElementById('admin-file-input');

let selectedUser = null;

socket.on('new-user-message', (data) => {
  if (!document.getElementById(`user-${data.userId}`)) {
    const userBtn = document.createElement('button');
    userBtn.id = `user-${data.userId}`;
    userBtn.textContent = data.userId;
    userBtn.onclick = () => {
      selectedUser = data.userId;
      adminBox.innerHTML = '';
    };
    userList.appendChild(userBtn);
  }

  if (data.userId === selectedUser) {
    if (data.image) appendAdminChat('Buyer', data.image, true);
    else appendAdminChat('Buyer', data.message);
  }
});

function sendAdminMessage() {
  if (!selectedUser) return alert('Pilih user dulu');
  const msg = adminInput.value.trim();
  if (msg) {
    socket.emit('admin-reply', { userId: selectedUser, message: msg });
    appendAdminChat('Admin', msg, false);
    adminInput.value = '';
  }
}

adminFileInput?.addEventListener('change', () => {
  const file = adminFileInput.files[0];
  if (!selectedUser) return alert('Pilih user dulu');
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('admin-reply', { userId: selectedUser, image: reader.result });
      appendAdminChat('Admin', reader.result, true);
    };
    reader.readAsDataURL(file);
  }
});

function appendAdminChat(sender, content, isImage = false) {
  const msg = document.createElement('div');
  msg.className = 'message' + (sender === 'Admin' ? ' admin' : '');
  msg.innerHTML = isImage
    ? `<strong>${sender}:</strong><br><img src="${content}" alt="image" />`
    : `<strong>${sender}:</strong> ${content}`;
  adminBox.appendChild(msg);
  adminBox.scrollTop = adminBox.scrollHeight;
}