const { HIERARCHY } = require('../constants/user')

const getRecursiveRoles = (role) => {
  const userRoles = [role]

  const parentRole = Object.keys(HIERARCHY).find((key) => HIERARCHY[key].inherits === role)

  if (parentRole) {
    userRoles.push(...getRecursiveRoles(parentRole))
  }

  return userRoles
}

module.exports = getRecursiveRoles
