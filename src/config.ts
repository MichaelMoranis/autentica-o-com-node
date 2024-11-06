import { randomBytes } from "node:crypto";

export const JWT_SECRET = randomBytes(32).toString('hex')

console.log(JWT_SECRET)