// ---------- REQUIRED PACKAGES ----------
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- SETUP ----------
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.render("index", { success: undefined });
});

app.post("/convert-mp3", async (req, res) => {
  let videoId = req.body.videoID.trim();

  // Deteksi format link YouTube
  if (videoId.includes("v=")) {
    // Format: https://www.youtube.com/watch?v=xxxx
    const urlParams = new URLSearchParams(videoId.split("?")[1]);
    videoId = urlParams.get("v");
  } else if (videoId.includes("youtu.be/")) {
    // Format: https://youtu.be/xxxx?si=...
    const parts = videoId.split("youtu.be/");
    if (parts[1]) {
      videoId = parts[1].split("?")[0];
    }
  }

  // Validasi
  if (!videoId) {
    return res.render("index", { success: false, message: "Link videonya belum dimasukkin" });
  }

  try {
    // Fetch ke RapidAPI
    const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": process.env.API_HOST
      }
    });

    const fetchResponse = await fetchAPI.json();
    console.log(fetchResponse);

    if (fetchResponse.status === "ok") {
      res.render("index", {
        success: true,
        song_title: fetchResponse.title,
        song_link: fetchResponse.link,
        videoId: videoId
      });
    } else {
      res.render("index", {
        success: false,
        message: fetchResponse.message
      });
    }

  } catch (error) {
    console.error("Error saat fetch:", error);
    res.render("index", { success: false, message: "Terjadi kesalahan server" });
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
