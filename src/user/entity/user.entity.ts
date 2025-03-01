import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: number;

  @Field()
  email: string;

  @Field({ nullable: true })
  username?: string;

  password: string; // ❌ Do NOT expose this in GraphQL
}
