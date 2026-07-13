import request from 'supertest'
import { connectTestDB, clearTestDB, closeTestDB } from '../setup.js'
import app from '../../src/app.js'

describe('Auth API — integration tests', () => {
  beforeAll(connectTestDB)
  afterEach(clearTestDB)
  afterAll(closeTestDB)

  describe('POST /api/auth/register', () => {
    it('returns 201 on valid registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alex', email: 'alex@test.com', password: 'StrongPass123!' })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('returns 400 on weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alex', email: 'alex@test.com', password: 'weak' })
      expect(res.status).toBe(400)
      expect(res.body.errors).toBeDefined()
    })

    it('returns 400 on invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alex', email: 'notanemail', password: 'StrongPass123!' })
      expect(res.status).toBe(400)
    })

    it('returns 409 on duplicate email', async () => {
      const payload = { name: 'Alex', email: 'dup@test.com', password: 'StrongPass123!' }
      await request(app).post('/api/auth/register').send(payload)
      const res = await request(app).post('/api/auth/register').send(payload)
      expect(res.status).toBe(409)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Test', email: 'login@test.com', password: 'StrongPass123!'
      })
      const User = (await import('../../src/modules/user/user.model.js')).default
      await User.updateOne({ email: 'login@test.com' }, { isVerified: true })
    })

    it('returns accessToken and sets cookie on valid login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'StrongPass123!' })
      expect(res.status).toBe(200)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.headers['set-cookie']).toBeDefined()
    })

    it('returns 401 on wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'WrongPassword123!' })
      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Invalid credentials')
    })

    it('same error for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'AnyPass123!' })
      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Invalid credentials')
    })
  })

  describe('Protected routes', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/orgs')
      expect(res.status).toBe(401)
    })

    it('returns 401 with expired/invalid token', async () => {
      const res = await request(app)
        .get('/api/orgs')
        .set('Authorization', 'Bearer invalid.token.here')
      expect(res.status).toBe(401)
    })
  })
})
