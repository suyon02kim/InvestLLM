const chatContainer = document.getElementById("chat-container");
const messageText = document.getElementById("message-text");
const sendButton = document.getElementById("send-button");
const messagePic = document.getElementById("message-pic");
let picFile; 

messageText.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent default form submission
    sendButton.click(); // Simulate a click on the Send button
  }
});

function handleLongWords(text, maxLength) {
  const words = text.split(/\s+/);
  let result = "";
  for (const word of words) {
    if (word.length > maxLength) {
      // Implement hyphenation or truncation logic for long words
      result += word.slice(0, maxLength) + "- "; // Example hyphenation
    } else {
      result += word + " ";
    }
  }
  return result.trim();
}

async function displayResponse(response) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", "model"); 1 
  chatContainer.appendChild(messageElement);

  const paragraphs = response.split(/\n\n|\n/);

  for (const paragraph of paragraphs) {
    const p = document.createElement("p");
    p.textContent = paragraph;
    messageElement.appendChild(p);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Add a class to the message element for custom styling
  messageElement.classList.add("model-response");
}

// // Stores selected image file 
messagePic.addEventListener('change', () => {
  picFile = messagePic.files[0];
}); 

sendButton.addEventListener("click", async () => {
  const message = messageText.value.trim();
  messageText.value = ""; // Clear the input field
  if (!message) return;  

  // // Display the user's message
  const userMessage = document.createElement("div");
  userMessage.classList.add("user-input");
  userMessage.innerHTML = `<p>${message}</p>`;
  chatContainer.appendChild(userMessage);

  const formData = new FormData();
  formData.append("message", message);
  formData.append("chatId", 1);
  
  let response; 

  // // if user uploads image, display the user's image 
  if (picFile){
    formData.append("image", picFile);
    // Send the message with image to the backend using fetch API
    response = await fetch("http://localhost:8080/withimage", {
      method: "POST",
      body:formData
    });
    const reader = new FileReader();
    reader.onload = () => {
      imageUrl = reader.result;
      const userImage = document.createElement("div");
      userImage.classList.add("user-image")
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = "Your uploaded image";
      userImage.appendChild(image);

      chatContainer.appendChild(image);
    };
    reader.readAsDataURL(picFile);

  } else {
    // Send only message to the backend using fetch API
    response = await fetch("http://localhost:8080/chat", {
      method: "POST",
      body:formData
    });
  }

  const data = await response.json();
  if (data.error) {
    console.error(data.error);
    return;
  }
  displayResponse(data.response);
  messagePic.value = '';
  picFile = null;
});

// Function to display received messages
function displayMessage(message, role) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", role);
  if (message.text) {
    messageElement.innerHTML = `<p>${message.text}</p>`;
  } else if (message.image_url) {
    messageElement.innerHTML = `<img src="${message.image_url}" alt="User image">`;
  }
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}