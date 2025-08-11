const request = require('supertest');
const bcrypt = require('bcrypt');

jest.mock('../db');
const db = require('../db');
const app = require('../index');

beforeEach(() => {
  db.query.mockReset();
});

describe('User registration and login', () => {
  test('registers a user successfully', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({
        rows: [{
          id_usuario: 'abc123',
          nome_completo: 'Test User',
          email: 'test@example.com',
          nivel_acesso: 'user',
          data_criacao: '2024-01-01'
        }],
        rowCount: 1
      });

    const res = await request(app)
      .post('/usuarios')
      .send({ nome_completo: 'Test User', email: 'test@example.com', senha: 'secret' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id_usuario: 'abc123',
      nome_completo: 'Test User',
      email: 'test@example.com',
      nivel_acesso: 'user',
      data_criacao: '2024-01-01'
    });
  });

  test('logs in a user successfully', async () => {
    const passwordHash = await bcrypt.hash('secret', 10);

    db.query.mockResolvedValueOnce({
      rows: [{
        id_usuario: 'abc123',
        nome_completo: 'Test User',
        email: 'test@example.com',
        senha_hash: passwordHash,
        nivel_acesso: 'user',
        data_criacao: '2024-01-01',
        foto_perfil: null,
        telefone: null,
        genero: null,
        cpf: null,
        data_nascimento: null
      }],
      rowCount: 1
    });

    const res = await request(app)
      .post('/usuarios/login')
      .send({ email: 'test@example.com', senha: 'secret' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario).toEqual({
      id_usuario: 'abc123',
      nome_completo: 'Test User',
      email: 'test@example.com',
      nivel_acesso: 'user',
      data_criacao: '2024-01-01',
      foto_perfil: null,
      telefone: null,
      genero: null,
      cpf: null,
      data_nascimento: null
    });
  });
});
