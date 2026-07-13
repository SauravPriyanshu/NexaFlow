import bcrypt from 'bcryptjs'
import User from '../src/modules/user/user.model.js'
import Org from '../src/modules/org/org.model.js'
import Project from '../src/modules/project/project.model.js'
import { generateAccessToken } from '../src/shared/utils/generateTokens.js'

export async function createTestUser(overrides = {}) {
  const user = await User.create({
    name: 'Test User',
    email: `test_${Date.now()}@nexaflow.test`,
    passwordHash: await bcrypt.hash('TestPass123!', 10),
    isVerified: true,
    ...overrides
  })
  const accessToken = generateAccessToken(user._id, user.email)
  return { user, accessToken }
}

export async function createTestOrg(ownerId) {
  return Org.create({
    name: 'Test Organization',
    ownerId,
    members: [{ userId: ownerId, role: 'owner' }]
  })
}

export async function createTestProject(orgId, creatorId) {
  return Project.create({
    name: 'Test Project',
    orgId,
    createdBy: creatorId,
    members: [{ userId: creatorId, role: 'manager' }]
  })
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}
