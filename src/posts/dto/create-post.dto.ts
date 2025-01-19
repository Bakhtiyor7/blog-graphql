import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TagInput {
  @Field()
  name: string;
}

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  author: string;

  @Field()
  categoryName: string;

  @Field(() => [TagInput], { nullable: true }) // ✅ Accepts array of TagInput objects
  tags?: TagInput[];
}
