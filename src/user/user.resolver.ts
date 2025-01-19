import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.create(createUserInput);
  }
}
