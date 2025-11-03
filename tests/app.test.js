const fs = require('fs');
const path = require('path');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'super-secret-for-tests';
process.env.JWT_TTL = '15m';
process.env.DB_DIALECT = 'sqlite';
const testDbPath = process.env.DB_STORAGE || path.join(__dirname, '..', 'crm_db.test.sqlite');
process.env.DB_STORAGE = testDbPath;

const { app } = require('../server');
const { sequelize } = require('../models');

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
});

afterEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
  if (fs.existsSync(testDbPath)) {
    await fs.promises.unlink(testDbPath);
  }
});

const registerAndLogin = async (overrides = {}) => {
  const payload = {
    name: 'Casey Counselor',
    email: 'casey@example.com',
    password: 'example-password',
    ...overrides,
  };

  await request(app)
    .post('/api/employees/register')
    .send(payload)
    .expect(201);

  const { body } = await request(app)
    .post('/api/employees/login')
    .send({ email: payload.email, password: payload.password })
    .expect(200);

  return body.token;
};

describe('Fastor CRM API', () => {
  test('rejects listing public enquiries without auth', async () => {
    await request(app)
      .get('/api/enquiries/public')
      .expect(401);
  });

  test('full enquiry lifecycle', async () => {
    const token = await registerAndLogin();

    const createRes = await request(app)
      .post('/api/enquiries/public')
      .send({
        name: 'Taylor Prospect',
        email: 'taylor@example.com',
        courseInterest: 'Data Science',
      })
      .expect(201);

    expect(createRes.body.enquiry).toHaveProperty('id');
    const enquiryId = createRes.body.enquiry.id;

    const listPublicRes = await request(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listPublicRes.body.enquiries).toHaveLength(1);
    expect(listPublicRes.body.enquiries[0]).toMatchObject({
      id: enquiryId,
      claimed: false,
    });

    await request(app)
      .patch(`/api/enquiries/${enquiryId}/claim`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const postClaimPublic = await request(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(postClaimPublic.body.enquiries).toHaveLength(0);

    const privateRes = await request(app)
      .get('/api/enquiries/private')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(privateRes.body.enquiries).toHaveLength(1);
    expect(privateRes.body.enquiries[0]).toMatchObject({
      id: enquiryId,
      claimed: true,
    });
  });
});
