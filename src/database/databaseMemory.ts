import { randomUUID } from "node:crypto"
import * as bcrypt from 'bcrypt'

export class DataBaseMemory {
    #persona = new Map()
    #users = new Map()

    list() {
        return Array.from(this.#persona.entries()).map((personaArray) => {
            const id = personaArray[0]
            const data = personaArray[1]

            return {
                id,
                ...data
            }
        })
    }

    create(persona) {
        const videoId = randomUUID()

        this.#persona.set(videoId, persona)
    }

    update(id, persona) {        
        this.#persona.set(id, persona)
    }

    delete(id) {
        this.#persona.delete(id)
    }

   // função para gerenciar e criar novos usuarios
    async createUser({username, password}) {
        const handlePassword = await bcrypt.hash(password, 10)
        const userId = randomUUID()

        this.#users.set(userId, {username, password: handlePassword})
        
        return userId
    }

    // função para buscar nomes de usuarios
    findUserByUsername(username) {
        return Array.from(this.#users.values()).find(user => user.username === username)
    }
}