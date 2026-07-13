import request from 'supertest'
import { connectTestDB, clearTestDB, closeTestDB } from '../setup.js'
import { createTestUser, createTestOrg, createTestProject, authHeader } from '../helpers.js'
import app from '../../src/app.js'

describe('Task API — integration tests', () => {
  beforeAll(connectTestDB)
  afterEach(clearTestDB)
  afterAll(closeTestDB)

  let token, orgId, projectId

  beforeEach(async () => {
    const { user, accessToken } = await createTestUser()
    token = accessToken
    const org = await createTestOrg(user._id)
    orgId = org._id
    const project = await createTestProject(orgId, user._id)
    projectId = project._id
  })

  it('POST /api/tasks — creates task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .send({ title: 'New task', projectId, orgId })
    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe('New task')
    expect(res.body.data.status).toBe('todo')
  })

  it('GET /api/tasks/project/:id — returns grouped columns', async () => {
    await request(app).post('/api/tasks').set(authHeader(token))
      .send({ title: 'T1', projectId, orgId })
    const res = await request(app)
      .get(`/api/tasks/project/${projectId}`)
      .set(authHeader(token))
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('todo')
    expect(res.body.data.todo[0].title).toBe('T1')
  })

  it('PATCH /api/tasks/:id/status — moves task to new column', async () => {
    const create = await request(app).post('/api/tasks').set(authHeader(token))
      .send({ title: 'Move me', projectId, orgId })
    const taskId = create.body.data._id

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set(authHeader(token))
      .send({ status: 'in_progress', order: 1000 })
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('in_progress')
  })

  it('DELETE /api/tasks/:id — deletes task', async () => {
    const create = await request(app).post('/api/tasks').set(authHeader(token))
      .send({ title: 'Delete me', projectId, orgId })
    const taskId = create.body.data._id

    const del = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set(authHeader(token))
    expect(del.status).toBe(200)
  })

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get(`/api/tasks/project/${projectId}`)
    expect(res.status).toBe(401)
  })
})
