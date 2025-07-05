import { Field, ObjectType } from '@nestjs/graphql';
import { Comment } from './comment.entity';

@ObjectType()
export class Tag {
  @Field()
  id: number;

  @Field()
  name: string;
}

@ObjectType()
export class Category {
  @Field()
  id: number;

  @Field()
  name: string;
}

@ObjectType()
export class Post {
  @Field()
  id: number;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  author: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  image?: string;

  @Field(() => Category, { nullable: true })
  category: Category;

  @Field(() => [Tag], { nullable: true }) // ✅ Explicitly define type as an array
  tags: Tag[];

  @Field(() => [Comment], { nullable: true })
  comments: Comment[];
}
