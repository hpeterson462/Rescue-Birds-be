require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  beforeAll(done => {
    return client.connect(done);
  });

  beforeEach(() => {
    // TODO: ADD DROP SETUP DB SCRIPT
    execSync('npm run setup-db');
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns animals', async() => {

    const expectation = [
      {
        'id': 1,
        'name': 'bessie',
        'coolfactor': 3,
        'owner_id': 1
      },
      {
        'id': 2,
        'name': 'jumpy',
        'coolfactor': 4,
        'owner_id': 1
      },
      {
        'id': 3,
        'name': 'spot',
        'coolfactor': 10,
        'owner_id': 1
      }
    ];

    const data = await fakeRequest(app)
      .get('/animals')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
