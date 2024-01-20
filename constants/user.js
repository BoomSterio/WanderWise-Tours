const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  LEAD_GUIDE: 'lead-guide',
  GUIDE: 'guide',
  USER: 'user',
})

const HIERARCHY = {
  [USER_ROLES.ADMIN]: {
    inherits: USER_ROLES.TECHNICIAN,
  },
  [USER_ROLES.TECHNICIAN]: {
    inherits: USER_ROLES.LEAD_GUIDE,
  },
  [USER_ROLES.LEAD_GUIDE]: {
    inherits: USER_ROLES.GUIDE,
  },
  [USER_ROLES.USER]: {},
}

module.exports = { USER_ROLES, HIERARCHY }
