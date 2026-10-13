import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Servir arquivos estáticos da pasta dist gerada pelo Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// Roteamento SPA: qualquer rota retorna index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor Cabe.AI rodando na porta ${port}`);
});
