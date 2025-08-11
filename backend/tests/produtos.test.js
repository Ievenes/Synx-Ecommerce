const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../db');
const db = require('../db');
const app = require('../index');

beforeEach(() => {
  db.query.mockReset();
});

describe('Produtos endpoints', () => {
  test('list products successfully', async () => {
    const rows = [
      { id_produto: '1', codigo: 'P1', nome: 'Prod1', preco: 10, categoria: 'cat', descricao: 'desc', imagem: null, data_criacao: '2024-01-01' },
      { id_produto: '2', codigo: 'P2', nome: 'Prod2', preco: 20, categoria: 'cat2', descricao: 'desc2', imagem: null, data_criacao: '2024-01-02' }
    ];
    db.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get('/produtos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test('create product successfully', async () => {
    db.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/produtos')
      .send({ codigo: 'P1', nome: 'Prod1', preco: 10 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ mensagem: 'Produto criado com sucesso' });
  });

  test('delete product successfully', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const token = jwt.sign({}, process.env.JWT_SECRET || 'secret');

    const res = await request(app)
      .delete('/produtos/123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mensagem: 'Produto removido com sucesso' });
  });
});
