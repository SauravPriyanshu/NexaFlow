import { connectTestDB, clearTestDB, closeTestDB } from '../setup.js'
import { createTestUser, createTestOrg, createTestProject } from '../helpers.js'
import { createTask, getTasksByProject, updateTaskStatus } from '../../src/modules/task/task.service.js'

describe('Task Service — unit tests', () => {
  beforeAll(connectTestDB)
  afterEach(clearTestDB)
  afterAll(closeTestDB)

  let user, org, project

  beforeEach(async () => {
    const { user: u } = await createTestUser()
    user = u
    org = await createTestOrg(user._id)
    project = await createTestProject(org._id, user._id)
  })

  it('creates a task with default status todo', async () => {
    const task = await createTask({
      title: 'Test task',
      projectId: project._id,
      orgId: org._id,
      createdBy: user._id
    })
    expect(task.title).toBe('Test task')
    expect(task.status).toBe('todo')
    expect(task.order).toBeGreaterThan(0)
  })

  it('returns tasks grouped by status', async () => {
    await createTask({ title: 'Task 1', projectId: project._id, orgId: org._id, createdBy: user._id })
    await createTask({ title: 'Task 2', projectId: project._id, orgId: org._id, createdBy: user._id })

    const columns = await getTasksByProject(project._id, user._id, {})
    expect(columns).toHaveProperty('todo')
    expect(columns).toHaveProperty('in_progress')
    expect(columns.todo).toHaveLength(2)
  })

  it('updates task status', async () => {
    const task = await createTask({
      title: 'Move me', projectId: project._id, orgId: org._id, createdBy: user._id
    })
    await updateTaskStatus(task._id, user._id, { status: 'in_progress', order: 1000 })
    const updated = await getTasksByProject(project._id, user._id, {})
    expect(updated.in_progress).toHaveLength(1)
    expect(updated.in_progress[0].title).toBe('Move me')
  })

  it('assigns fractional order between tasks', async () => {
    const t1 = await createTask({ title: 'T1', projectId: project._id, orgId: org._id, createdBy: user._id })
    const t2 = await createTask({ title: 'T2', projectId: project._id, orgId: org._id, createdBy: user._id })
    // t2.order should be greater than t1.order
    expect(t2.order).toBeGreaterThan(t1.order)
  })
})
