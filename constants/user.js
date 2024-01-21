const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  LEAD_GUIDE: 'lead-guide',
  GUIDE: 'guide',
  USER: 'user',
})

const HIERARCHY = Object.freeze({
  [USER_ROLES.ADMIN]: {
    inherits: USER_ROLES.TECHNICIAN,
  },
  [USER_ROLES.TECHNICIAN]: {
    inherits: USER_ROLES.LEAD_GUIDE,
  },
  [USER_ROLES.LEAD_GUIDE]: {
    inherits: USER_ROLES.GUIDE,
  },
  [USER_ROLES.GUIDE]: {
    inherits: USER_ROLES.USER,
  },
  [USER_ROLES.USER]: {},
})

const getRecursiveRoles = (role) => {
  const userRoles = [role]

  const parentRole = Object.keys(HIERARCHY).find((key) => HIERARCHY[key].inherits === role)

  if (parentRole) {
    userRoles.push(...getRecursiveRoles(parentRole))
  }

  return userRoles
}

module.exports = { USER_ROLES, HIERARCHY, getRecursiveRoles }
