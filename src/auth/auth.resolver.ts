import { Resolver, Mutation, Args, Context } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { AuthInput } from './dto/auth-input'
import { AuthResponse } from './dto/auth-response'
import { Response } from 'express'

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    // TODO: add httponly cookie
    @Mutation(() => AuthResponse)
    async login(@Args('authInput') authInput: AuthInput) {
        const user = await this.authService.validateUser(
            authInput.username,
            authInput.password
        )
        if (!user) {
            throw new Error('Invalid credentials')
        }
        return this.authService.login(user)
    }

    @Mutation(() => Boolean, { name: 'logout' })
    async logout(@Context() context: { res: Response }): Promise<boolean> {
        // Clear the cookie; this tells the browser to drop the JWT
        context.res.clearCookie('jid', { path: '/' })
        return true
    }
}
