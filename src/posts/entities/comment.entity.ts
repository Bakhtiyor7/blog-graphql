import { Field, ObjectType } from '@nestjs/graphql';
// import { Post } from './post.entity';

@ObjectType()
export class Comment {
  @Field()
  id: number;

  @Field()
  content: string;

  @Field()
  author: string;

  // @Field(() => Post)
  // post: Post;

  @Field()
  postId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
