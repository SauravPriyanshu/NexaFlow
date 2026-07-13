import request from 'supertest'
import { connectTestDB, closeTestDB } from '../setup.js'
import app from '../../src/app.js'

describe('Health check', () => {
  beforeAll(connectTestDB)
  afterAll(closeTestDB)

  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.database).toBe('connected')
  })
})
