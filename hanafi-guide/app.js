const express = require('express');
const dotenv = require('dotenv');
const chatbotRoutes = require('./routes/chatbotRoutes');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/chat', chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🕌 Hanafi Guide running on port ${PORT}`));
