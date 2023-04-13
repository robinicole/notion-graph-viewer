const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const token = process.ENV.NOTION_TOKEN;
const databaseUri = process.ENV.NOTION_DATABASE_URI;

app.post("/api/notion-data", async (req, res) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-02-22",
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${databaseUri}/query`,
      {},
      { headers }
    );

    const results = response.data.results;

    res.json({ data: results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch data from Notion API" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
