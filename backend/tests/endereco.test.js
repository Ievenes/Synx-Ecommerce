const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../db');
const db = require('../db');
const app = require('../index');

beforeEach(() => {
  db.query.mockReset();
});

describe('Enderecos endpoints', () => {
  test('list addresses successfully', async () => {
    const rows = [
      { id_endereco: '1', id_usuario: 'u1', rua: 'Rua A', numero: '10', complemento: '', bairro: 'B', cidade: 'C', estado: 'E', cep: '00000-000' }
    ];
    db.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get('/enderecos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test('create address successfully', async () => {
    db.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/enderecos')
      .send({ id_usuario: 'u1', rua: 'Rua A', numero: '10', bairro: 'B', cidade: 'C', estado: 'E', cep: '00000-000' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ mensagem: 'Endere\u00e7o cadastrado com sucesso.' });
  });

  test('delete address successfully', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const token = jwt.sign({}, process.env.JWT_SECRET || 'secret');

    const res = await request(app)
      .delete('/enderecos/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mensagem: 'Endere\u00e7o exclu\u00eddo com sucesso.' });
  });
});
