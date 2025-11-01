import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// ✅ 兜底路由
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(3100, () => console.log('Server running at http://localhost:3100'));