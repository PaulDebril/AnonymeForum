const request = require('supertest');
const app = require('../src/app');

describe('GET /hello', () => {
  it('doit répondre 200 et renvoyer le message attendu', async () => {
    const res = await request(app).get('/hello');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'Hello, bienvenue sur API de PAULD'
    });
  });
});
