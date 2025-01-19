import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../user/entity/user.entity';
import { LoginInput, RegisterInput } from './dto/auth.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  async register(@Args('input') input: RegisterInput): Promise<User> {
    const result = await this.authService.register(input);
    return result;
  }

  @Mutation(() => String)
  async login(@Args('input') input: LoginInput): Promise<string> {
    const { accessToken } = await this.authService.login(input);
    return accessToken;
  }
}
