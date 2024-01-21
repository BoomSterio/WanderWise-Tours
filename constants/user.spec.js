const { USER_ROLES, getRecursiveRoles } = require('./user')

describe(
  '🔎 Teting getRecursiveRoles function ' +
    'which accepts minimal required role ' +
    'and returns an array containing THIS role and all roles that inherit it',
  () => {
    test('user role must return all roles', () => {
      expect(getRecursiveRoles(USER_ROLES.USER).sort()).toStrictEqual(Object.values(USER_ROLES).sort())
    })
    test('guide role must return guide and all roles of higher rank', () => {
      expect(getRecursiveRoles(USER_ROLES.USER).sort()).toStrictEqual(Object.values(USER_ROLES).sort())
    })
  },
)
