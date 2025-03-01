import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
export class Tag {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field(() => [Post], { nullable: true })
  posts: Post[];
}
