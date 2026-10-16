
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/companies", (req, res) => {
  res.json([
    { id: 1, name: "Google", location: "Hyderabad" },
    { id: 2, name: "Microsoft", location: "Bangalore" }
  ]);
});

app.listen(5000, () => {
  console.log("API running on port 5000");
});
