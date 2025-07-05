import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreatePostInput } from './create-post.dto';

@InputType()
export class UpdatePostInput extends PartialType(CreatePostInput) {
  @Field(() => Int)
  id: number;
  @Field({ nullable: true }) image?: string;
}
