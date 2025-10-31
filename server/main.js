import express from "express";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, "data");

// ✅ 启动时确保 data 文件夹存在
await fs.mkdir(DATA_DIR, { recursive: true });

const allowedOrigins = ["http://localhost:8081", "http://localhost:5566"];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 允许跨域携带 cookie / 凭证
  })
);
app.use(express.json());

// ✅ 接口1: 保存 data 为 json 文件，生成 json_id 与 temp_id 映射
app.post("/save", async (req, res) => {
  try {
    const { data, temp_id } = req.body;
    if (!data || !temp_id) {
      return res.status(400).json({ error: "Missing data or temp_id" });
    }

    const json_id = nanoid(8);
    const filePath = path.join(DATA_DIR, `${json_id}.json`);
    const content = { json_id, temp_id, data };

    await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");

    return res.json({ json_id, temp_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ 接口2: 根据 json_id 获取 json 内容
app.get("/json/:json_id", async (req, res) => {
  try {
    const { json_id } = req.params;
    const filePath = path.join(DATA_DIR, `${json_id}.json`);

    const fileData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileData);

    res.json(json);
  } catch (err) {
    res.status(404).json({ error: "JSON not found" });
  }
});

// ✅ 接口3: 根据 json_id 获取 temp_id
app.get("/temp/:json_id", async (req, res) => {
  try {
    const { json_id } = req.params;
    const filePath = path.join(DATA_DIR, `${json_id}.json`);
    const fileData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileData);
    const files = await fs.readdir(DATA_DIR);

    const temp_id =  json.temp_id
    const tempFilePath = path.join(DATA_DIR, `${temp_id}.json`);
    const content = JSON.parse(await fs.readFile(tempFilePath, "utf-8"));
    if (content) {
      return res.json(content);
    }

    res.status(404).json({ error: "temp_id not found" });
  } catch (err) {
    res.status(404).json({ error: "JSON not found" });
  }
});

// ✅ 接口4: 根据 temp_id 获取对应的 JSON 文件内容
app.get("/by-temp/:temp_id", async (req, res) => {
  try {
    const { temp_id } = req.params;
    const files = await fs.readdir(DATA_DIR);

    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      const content = JSON.parse(await fs.readFile(filePath, "utf-8"));
      if (content.temp_id === temp_id) {
        return res.json(content);
      }
    }

    res.status(404).json({ error: "temp_id not found" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ 接口5: 保存模板
app.post("/save_temp", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Missing data or temp_id" });
    }

    const temp_id = nanoid(8);
    const filePath = path.join(DATA_DIR, `${temp_id}.json`);
    const content = { ...data };

    await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");

    return res.json({ temp_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
