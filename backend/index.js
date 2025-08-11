require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas
const usuariosRoutes = require('./routes/usuariosRoutes');
app.use('/usuarios', usuariosRoutes);

const enderecoRoutes = require('./routes/enderecoRoutes');
app.use('/enderecos', enderecoRoutes);

const produtosRoutes = require('./routes/produtosRoutes');
app.use('/produtos', produtosRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.send('✅ API do projeto está rodando com sucesso!');
});

// Middleware 404
app.use((req, res, next) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
