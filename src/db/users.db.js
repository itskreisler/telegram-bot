import JsonDb from '@kreisler/js-jsondb'
import { isEmptyArray } from '../helpers.js'

export const userDb = new JsonDb('src/json')
export const userJson = 'user'
export const userExist = (where) => {
  const q = userDb.select(userJson, ({ id }) => id === where)
  if (isEmptyArray(q)) {
    return [false, []]
  }
  return [true, q]
}
