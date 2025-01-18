import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Logger } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.dto';

@Resolver('posts')
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  private readonly logger = new Logger(PostsService.name);

  @Query(() => [Post])
  async getPosts(): Promise<Post[]> {
    this.logger.log('Entering getPosts resolver method');
    return this.postsService.findAll();
  }

  @Mutation(() => Post)
  async createPost(@Args('input') input: CreatePostInput): Promise<Post> {
    this.logger.log('Entering post title resolver method');
    return this.postsService.create(input);
  }
}
