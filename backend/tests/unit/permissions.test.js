import { hasPermission, PERMISSIONS } from '../../src/shared/utils/permissions.js'

describe('RBAC Permission Matrix', () => {
  it('owner has all permissions', () => {
    const ownerPerms = PERMISSIONS.owner
    expect(ownerPerms).toContain('create_project')
    expect(ownerPerms).toContain('delete_project')
    expect(ownerPerms).toContain('transfer_ownership')
  })

  it('viewer has no permissions', () => {
    expect(PERMISSIONS.viewer).toHaveLength(0)
    expect(hasPermission('viewer', 'manage_tasks')).toBe(false)
  })

  it('developer can manage tasks but not invite', () => {
    expect(hasPermission('developer', 'manage_tasks')).toBe(true)
    expect(hasPermission('developer', 'invite_member')).toBe(false)
  })

  it('manager can invite but not delete project', () => {
    expect(hasPermission('manager', 'invite_member')).toBe(true)
    expect(hasPermission('manager', 'delete_project')).toBe(false)
  })

  it('admin can delete project but not transfer ownership', () => {
    expect(hasPermission('admin', 'delete_project')).toBe(true)
    expect(hasPermission('admin', 'transfer_ownership')).toBe(false)
  })

  it('returns false for unknown role', () => {
    expect(hasPermission('superadmin', 'manage_tasks')).toBe(false)
  })
})
