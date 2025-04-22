const request = require('supertest');
const app = require('../../server');
require('./setup');

describe('Job Tests', () => {
  let authToken;
  let testLocation;
  let testOrganization;

  const testUser = {
    name: 'Test User',
    email: 'test.jobs@example.com',
    password: 'password123'
  };

  const testLocationData = {
    name: 'Test Location',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    coordinates: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128]
    }
  };

  const testOrganizationData = {
    name: 'Test Organization',
    contactName: 'John Doe',
    phone: '123-456-7890',
    email: 'org@example.com'
  };

  const testJob = {
    title: 'Test Job',
    description: 'Test job description',
    date: new Date().toISOString(),
    startTime: new Date('2025-01-01T09:00:00Z').toISOString(),
    endTime: new Date('2025-01-01T17:00:00Z').toISOString()
  };

  // Setup before each test
  beforeEach(async () => {
    try {
      // Register test user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      if (!registerRes.body.token) {
        throw new Error('Failed to get token after registration');
      }

      authToken = registerRes.body.token;

      // Create test location
      const locationRes = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testLocationData);

      if (!locationRes.body.data) {
        throw new Error('Failed to create test location');
      }

      testLocation = locationRes.body.data;

      // Create test organization
      const organizationRes = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testOrganizationData);

      if (!organizationRes.body.data) {
        throw new Error('Failed to create test organization');
      }

      testOrganization = organizationRes.body.data;
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  describe('POST /api/jobs', () => {
    it('should create a new job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testJob,
          location: testLocation._id,
          organization: testOrganization._id
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('title', testJob.title);
      expect(res.body.data).toHaveProperty('location');
      expect(res.body.data).toHaveProperty('organization');
    });

    it('should not create job without authentication', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send(testJob);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/jobs', () => {
    let testJobId;

    beforeEach(async () => {
      // Create a test job before each test
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testJob,
          location: testLocation._id,
          organization: testOrganization._id
        });

      testJobId = jobRes.body.data._id;
    });

    it('should get all jobs for authenticated user', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should not get jobs without authentication', async () => {
      const res = await request(app)
        .get('/api/jobs');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/jobs/:id', () => {
    let jobId;

    beforeEach(async () => {
      // Create a test job before each test
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testJob,
          location: testLocation._id,
          organization: testOrganization._id
        });
      
      jobId = jobRes.body.data._id;
    });

    it('should get a single job by ID', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', jobId);
    });

    it('should not get job with invalid ID', async () => {
      const fakeId = '5f7d3a2b9d1c2b3a4c5d6e7f';
      const res = await request(app)
        .get(`/api/jobs/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    let jobId;

    beforeEach(async () => {
      // Create a test job before each test
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testJob,
          location: testLocation._id,
          organization: testOrganization._id
        });
      
      jobId = jobRes.body.data._id;
    });

    it('should update a job', async () => {
      const updateData = {
        title: 'Updated Test Job',
        description: 'Updated test description'
      };

      const res = await request(app)
        .put(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('title', updateData.title);
    });

    it('should not update job without authentication', async () => {
      const res = await request(app)
        .put(`/api/jobs/${jobId}`)
        .send({ title: 'Should Not Update' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not update non-existent job', async () => {
      const fakeId = '5f7d3a2b9d1c2b3a4c5d6e7f';
      const res = await request(app)
        .put(`/api/jobs/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Should Not Update' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    let jobId;

    beforeEach(async () => {
      // Create a test job before each test
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testJob,
          location: testLocation._id,
          organization: testOrganization._id
        });
      
      jobId = jobRes.body.data._id;
    });

    it('should delete a job', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify job is deleted
      const getRes = await request(app)
        .get(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(getRes.status).toBe(404);
    });

    it('should not delete job without authentication', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${jobId}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not delete non-existent job', async () => {
      const fakeId = '5f7d3a2b9d1c2b3a4c5d6e7f';
      const res = await request(app)
        .delete(`/api/jobs/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});