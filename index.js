const express = require("express");
const cors = require("cors");
const multer = require('multer');
const fs = require('fs');
const bodyParser = require("body-parser");
const { ask } = require("./gemini.service");
const upload = multer({ dest:'uploads/'});
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/withimage", upload.single('image'), async (req, res) => {
  try{
    const { message, chatId } = req.body;

    if (req.file){
      const { mimetype, path } = req.file;
      const imageBuffer = fs.readFileSync(path);
      const imageBase64 = imageBuffer.toString('base64');
      imgData = { mimetype, imageBase64 };
    }
    
    if (!chatId){
      return res.status(400).json({ error: "chat id is missing"});
    }
    if (!message) {
      return res.status(400).json({ error: "message is missing" }); 
    }
    
    const response = await ask(chatId, message, imgData);

    //deleting and resetting for the next picture and chat request
    if (req.file){
      fs.unlinkSync(req.file.path);
      req.file = null;
    };

    return res.json({ response });
  } catch(error) {
    console.log("I wasn't able to reach Gemini")
    console.error(error);
    res.status(500).json({ error: 'Error processing request'});
  }
});


app.post("/chat", upload.single('image'), async (req, res) => {
  try{
    const { message, chatId } = req.body;
    
    if (!chatId){
      return res.status(400).json({ error: "chat id is missing"});
    }
    if (!message) {
      return res.status(400).json({ error: "message is missing" }); 
    }

    const response = await ask(chatId, message, null);
    
    return res.json({ response });
  } catch(error) {
    console.log("I wasn't able to reach Gemini")
    console.error(error);
    res.status(500).json({ error: 'Error processing request'});
  }
});

app.listen(8080, () => {
  console.log("server running on port 8080");
});

