import { connectTestDB, clearTestDB, closeTestDB } from '../setup.js'
import { registerUser, loginUser, refreshAccessToken } from '../../src/modules/auth/auth.service.js'

describe('Auth Service — unit tests', () => {
  beforeAll(connectTestDB)
  afterEach(clearTestDB)
  afterAll(closeTestDB)

  describe('registerUser', () => {
    it('creates a user with hashed password', async () => {
      const result = await registerUser({
        name: 'Alex Smith',
        email: 'alex@test.com',
        password: 'StrongPass123!'
      })
      expect(result.email).toBe('alex@test.com')
      expect(result.passwordHash).toBeUndefined() // toPublicJSON strips it
      expect(result.isVerified).toBe(false)
    })

    it('throws 409 if email already registered', async () => {
      await registerUser({ name: 'A', email: 'dup@test.com', password: 'Pass123!' })
      await expect(
        registerUser({ name: 'B', email: 'dup@test.com', password: 'Pass123!' })
      ).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  describe('loginUser', () => {
    it('returns tokens on valid credentials', async () => {
      await registerUser({ name: 'Login User', email: 'login@test.com', password: 'Pass123!' })
      // Manually verify user for test
      const User = (await import('../../src/modules/user/user.model.js')).default
      await User.updateOne({ email: 'login@test.com' }, { isVerified: true })

      const result = await loginUser({ email: 'login@test.com', password: 'Pass123!' })
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(result.user.email).toBe('login@test.com')
    })

    it('throws 401 with wrong password', async () => {
      const User = (await import('../../src/modules/user/user.model.js')).default
      await User.create({
        name: 'Test', email: 'wrong@test.com',
        passwordHash: await (await import('bcryptjs')).default.hash('correct', 10),
        isVerified: true
      })
      await expect(
        loginUser({ email: 'wrong@test.com', password: 'wrongpassword' })
      ).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 403 if email not verified', async () => {
      await registerUser({ name: 'Unverified', email: 'unv@test.com', password: 'Pass123!' })
      await expect(
        loginUser({ email: 'unv@test.com', password: 'Pass123!' })
      ).rejects.toMatchObject({ statusCode: 403 })
    })

    it('same error message for wrong email and wrong password', async () => {
      const err1 = await loginUser({ email: 'nonexist@test.com', password: 'any' }).catch(e => e)
      const User = (await import('../../src/modules/user/user.model.js')).default
      await User.create({
        name: 'X', email: 'exist@test.com',
        passwordHash: await (await import('bcryptjs')).default.hash('correct', 10),
        isVerified: true
      })
      const err2 = await loginUser({ email: 'exist@test.com', password: 'wrong' }).catch(e => e)
      expect(err1.message).toBe(err2.message) // prevents user enumeration
    })
  })
})
