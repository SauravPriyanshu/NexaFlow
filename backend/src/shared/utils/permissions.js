const PERMISSIONS = {
  owner: [
    'view_org',
    'create_project',
    'delete_project',
    'invite_member',
    'remove_member',
    'manage_tasks',
    'upload_files',
    'manage_settings',
    'transfer_ownership'
  ],
  admin: [
    'view_org',
    'create_project',
    'delete_project',
    'invite_member',
    'remove_member',
    'manage_tasks',
    'upload_files',
    'manage_settings'
  ],
  manager: [
    'view_org',
    'create_project',
    'invite_member',
    'manage_tasks',
    'upload_files'
  ],
  developer: [
    'view_org',
    'manage_tasks',
    'upload_files'
  ],
  viewer: ['view_org']
};

const hasPermission = (role, action) => {
  //!! guarantees return true or false instead of truthy/falsy values
  //!!undefined = false, !!null = false, !!false = false, !!true = true
  return !!(PERMISSIONS[role] && PERMISSIONS[role].includes(action));
};

module.exports = {
  PERMISSIONS,
  hasPermission
};
