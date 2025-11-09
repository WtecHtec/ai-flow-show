// 必须在所有其他导入之前加载 dotenv
import 'dotenv/config';

import express from "express";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import cors from "cors";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const DATA_DIR = path.resolve(__dirname, "data");

// ✅ 启动时确保 data 文件夹存在
await fs.mkdir(DATA_DIR, { recursive: true });

const allowedOrigins = ["http://localhost:8080", "http://localhost:5566"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "未授权，请先登录" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "令牌无效或已过期" });
    }
    req.user = user;
    next();
  });
};

// ========== 用户认证相关接口 ==========

// 注册
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "用户名、邮箱和密码不能为空" });
    }

    // 检查用户是否已存在
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "用户名或邮箱已存在" });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    const userId = result.insertId;

    // 生成 JWT
    const token = jwt.sign(
      { userId, username, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "注册成功",
      token,
      user: { id: userId, username, email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 登录
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码不能为空" });
    }

    // 查找用户
    const [users] = await pool.execute(
      "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "登录成功",
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取当前用户信息
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "用户不存在" });
    }

    res.json({ user: users[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// ========== 模板管理相关接口 ==========

// 获取用户的模板列表
app.get("/api/templates", authenticateToken, async (req, res) => {
  try {
    const [templates] = await pool.execute(
      "SELECT id, temp_id, name, description, created_at, updated_at FROM templates WHERE user_id = ? ORDER BY updated_at DESC",
      [req.user.userId]
    );

    res.json({ templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取单个模板详情
app.get("/api/templates/:temp_id", authenticateToken, async (req, res) => {
  try {
    const { temp_id } = req.params;
    
    const [templates] = await pool.execute(
      "SELECT * FROM templates WHERE temp_id = ? AND user_id = ?",
      [temp_id, req.user.userId]
    );

    if (templates.length === 0) {
      return res.status(404).json({ error: "模板不存在" });
    }

    const template = templates[0];
    console.log(template);
    // template.schema_data = JSON.parse(template.schema_data);

    res.json({ template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 创建模板
app.post("/api/templates", authenticateToken, async (req, res) => {
  try {
    const { name, description, schema_data } = req.body;
    
    if (!name || !schema_data) {
      return res.status(400).json({ error: "模板名称和 schema 数据不能为空" });
    }

    const temp_id = nanoid(8);

    await pool.execute(
      "INSERT INTO templates (user_id, temp_id, name, description, schema_data) VALUES (?, ?, ?, ?, ?)",
      [req.user.userId, temp_id, name, description || "", JSON.stringify(schema_data)]
    );

    res.json({ message: "模板创建成功", temp_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 更新模板
app.put("/api/templates/:temp_id", authenticateToken, async (req, res) => {
  try {
    const { temp_id } = req.params;
    const { name, description, schema_data } = req.body;

    // 检查模板是否属于当前用户
    const [templates] = await pool.execute(
      "SELECT id FROM templates WHERE temp_id = ? AND user_id = ?",
      [temp_id, req.user.userId]
    );

    if (templates.length === 0) {
      return res.status(404).json({ error: "模板不存在" });
    }

    await pool.execute(
      "UPDATE templates SET  schema_data = ? WHERE temp_id = ? AND user_id = ?",
      [schema_data, temp_id, req.user.userId]
    );

    res.json({ message: "模板更新成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 删除模板
app.delete("/api/templates/:temp_id", authenticateToken, async (req, res) => {
  try {
    const { temp_id } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM templates WHERE temp_id = ? AND user_id = ?",
      [temp_id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "模板不存在" });
    }

    res.json({ message: "模板删除成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// ========== 数据源管理相关接口 ==========

// 获取用户的数据源列表
app.get("/api/data-sources", authenticateToken, async (req, res) => {
  try {
    const [dataSources] = await pool.execute(
      "SELECT id, name, type, config, created_at, updated_at FROM data_sources WHERE user_id = ? ORDER BY updated_at DESC",
      [req.user.userId]
    );

    // 解析 JSON 配置
    const sources = dataSources.map(ds => ({
      ...ds,
      config: JSON.parse(ds.config)
    }));

    res.json({ dataSources: sources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 创建数据源
app.post("/api/data-sources", authenticateToken, async (req, res) => {
  try {
    const { name, type, config } = req.body;
    
    if (!name || !type || !config) {
      return res.status(400).json({ error: "名称、类型和配置不能为空" });
    }

    const [result] = await pool.execute(
      "INSERT INTO data_sources (user_id, name, type, config) VALUES (?, ?, ?, ?)",
      [req.user.userId, name, type, JSON.stringify(config)]
    );

    res.json({ message: "数据源创建成功", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 更新数据源
app.put("/api/data-sources/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, config } = req.body;

    const [result] = await pool.execute(
      "UPDATE data_sources SET name = ?, type = ?, config = ? WHERE id = ? AND user_id = ?",
      [name, type, JSON.stringify(config), id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "数据源不存在" });
    }

    res.json({ message: "数据源更新成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 删除数据源
app.delete("/api/data-sources/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM data_sources WHERE id = ? AND user_id = ?",
      [id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "数据源不存在" });
    }

    res.json({ message: "数据源删除成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});

// ========== 保留原有接口（兼容性） ==========

// ✅ 接口1: 保存 data 为 json 文件，生成 json_id 与 temp_id 映射
app.post("/save", async (req, res) => {
  try {
    const { data, temp_id } = req.body;
    if (!data || !temp_id) {
      return res.status(400).json({ error: "Missing data or temp_id" });
    }

    let newData = data;
    try {
      newData = JSON.parse(newData);
    } catch (err) {
      console.error(err);
    }
    
    const json_id = nanoid(8);
    const filePath = path.join(DATA_DIR, `${json_id}.json`);
    const content = { json_id, temp_id, data: newData };

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


app.post("/api/instances", async (req, res) => {
  try {
    const { temp_id, data_source_json } = req.body;
    
    if (!temp_id || !data_source_json) {
      return res.status(400).json({ error: "模板ID和数据源JSON不能为空" });
    }

    // 验证模板是否存在
    const [templates] = await pool.execute(
      "SELECT id FROM templates WHERE temp_id = ?",
      [temp_id]
    );

    if (templates.length === 0) {
      return res.status(404).json({ error: "模板不存在" });
    }

     // 生成 UUID
     const instanceId = nanoid(8);

     let data_source_json_resut = ""
     if (typeof data_source_json === 'object') {
      data_source_json_resut = JSON.stringify(data_source_json)
     } else {
      data_source_json_resut = data_source_json
     }
    // 创建实例
    await pool.execute(
      "INSERT INTO instances (id, temp_id, data_source_json) VALUES (?, ?, ?)",
      [instanceId, temp_id, JSON.stringify(data_source_json_resut)]
    );

    const viewUrl = process.env.BASE_URL + `/view/${instanceId}`;

    res.json({
      message: "实例创建成功",
      id: instanceId,
      view_url: viewUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});


// 接口1：根据实例ID获取模板内容
app.get("/api/instances/template/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 先获取实例信息
    const [instances] = await pool.execute(
      "SELECT temp_id FROM instances WHERE id = ?",
      [id]
    );

    if (instances.length === 0) {
      return res.status(404).json({ error: "实例不存在" });
    }

    const tempId = instances[0].temp_id;

    // 获取模板内容
    const [templates] = await pool.execute(
      "SELECT * FROM templates WHERE temp_id = ?",
      [tempId]
    );

    if (templates.length === 0) {
      return res.status(404).json({ error: "模板不存在" });
    }

    const template = templates[0];
    // template.schema_data = JSON.parse(template.schema_data);

    res.json({ template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});


// 接口2：根据实例ID获取数据源JSON数据
app.get("/api/instances/data-source/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [instances] = await pool.execute(
      "SELECT data_source_json FROM instances WHERE id = ?",
      [id]
    );

    if (instances.length === 0) {
      return res.status(404).json({ error: "实例不存在" });
    }

    const instance = instances[0];
    const dataSourceJson = instance.data_source_json;

    res.json({ data: dataSourceJson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
});


// 静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// ✅ 兜底路由
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});