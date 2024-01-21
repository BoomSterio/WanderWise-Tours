const { USER_ROLES } = require('../constants/user')
const getRecursiveRoles = require('./get-recursive-roles')

const { ADMIN, TECHNICIAN, LEAD_GUIDE, GUIDE, USER } = USER_ROLES

describe(
  '🔎 Teting getRecursiveRoles function ' +
    'which accepts minimal required role ' +
    'and returns an array containing THIS role and all superior roles',
  () => {
    test('user role must return all roles', () => {
      const expected = Object.values(USER_ROLES).sort()
      expect(getRecursiveRoles(USER).sort()).toStrictEqual(expected)
    })

    test('guide role must return guide and all roles of higher rank', () => {
      const expected = [ADMIN, TECHNICIAN, LEAD_GUIDE, GUIDE].sort()
      expect(getRecursiveRoles(GUIDE).sort()).toStrictEqual(expected)
    })

    test('lead-guide role must return lead-guide and all roles of higher rank', () => {
      const expected = [ADMIN, TECHNICIAN, LEAD_GUIDE].sort()
      expect(getRecursiveRoles(LEAD_GUIDE).sort()).toStrictEqual(expected)
    })

    test('technician role must return technician and all roles of higher rank', () => {
      const expected = [ADMIN, TECHNICIAN].sort()
      expect(getRecursiveRoles(TECHNICIAN).sort()).toStrictEqual(expected)
    })

    test('admin role must return and all roles of higher rank', () => {
      const expected = [ADMIN].sort()
      expect(getRecursiveRoles(ADMIN).sort()).toStrictEqual(expected)
    })
  },
)
