const baseUrl = process.env.LIVE_BASE_URL;

const WAIT_MS = Number(process.env.LIVE_WAIT_MS || 5000);
const MAX_ATTEMPTS = Number(process.env.LIVE_MAX_ATTEMPTS || 8);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseJson = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Expected JSON but received:\n${text}`);
  }
};

const warmUp = async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/enquiries/public`);
      if (response.status !== 404) {
        return;
      }
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }
    }
    await wait(WAIT_MS);
  }
  throw new Error('Service did not become reachable in time.');
};

const liveDescribe = baseUrl ? describe : describe.skip;

liveDescribe('Live deployment smoke test', () => {
  jest.setTimeout(120000);

  let token;
  let enquiryId;
  const uniqueSuffix = Date.now();
  const counselorEmail = `render-smoke-${uniqueSuffix}@example.com`;
  const password = 'SmokeSecret123';

  beforeAll(async () => {
    await warmUp();
  });

  test('Public enquiries endpoint is protected', async () => {
    const response = await fetch(`${baseUrl}/api/enquiries/public`);
    expect(response.status).toBe(401);
    const body = await parseJson(response);
    expect(body).toHaveProperty('message');
  });

  test('Register counselor on live service', async () => {
    const response = await fetch(`${baseUrl}/api/employees/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Render Smoke Tester',
        email: counselorEmail,
        password,
      }),
    });
    expect(response.status).toBe(201);
    const body = await parseJson(response);
    expect(body).toMatchObject({
      email: counselorEmail,
      name: 'Render Smoke Tester',
    });
  });

  test('Login counselor and capture JWT', async () => {
    const response = await fetch(`${baseUrl}/api/employees/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: counselorEmail,
        password,
      }),
    });
    expect(response.status).toBe(200);
    const body = await parseJson(response);
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('employee.email', counselorEmail);
    token = body.token;
  });

  test('Submit a public enquiry without authentication', async () => {
    const response = await fetch(`${baseUrl}/api/enquiries/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Taylor Prospect',
        email: `taylor-${uniqueSuffix}@example.com`,
        courseInterest: 'Data Science',
      }),
    });
    expect(response.status).toBe(201);
    const body = await parseJson(response);
    expect(body).toHaveProperty('enquiry.id');
    enquiryId = body.enquiry.id;
  });

  test('List unclaimed enquiries with JWT', async () => {
    const response = await fetch(`${baseUrl}/api/enquiries/public`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = await parseJson(response);
    expect(Array.isArray(body.enquiries)).toBe(true);
    expect(body.enquiries.some((item) => item.id === enquiryId)).toBe(true);
  });

  test('Claim the enquiry', async () => {
    const response = await fetch(`${baseUrl}/api/enquiries/${enquiryId}/claim`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = await parseJson(response);
    expect(body.enquiry).toMatchObject({
      id: enquiryId,
      claimed: true,
    });
  });

  test('Verify claimed enquiry no longer appears in public list', async () => {
    const response = await fetch(`${baseUrl}/api/enquiries/public`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = await parseJson(response);
    expect(body.enquiries.every((item) => item.id !== enquiryId)).toBe(true);
  });

  test('Verify claimed enquiry appears in private list', async () => {
    const response = await fetch(`${baseUrl}/api/enquiries/private`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = await parseJson(response);
    expect(body.enquiries.some((item) => item.id === enquiryId)).toBe(true);
  });
});
