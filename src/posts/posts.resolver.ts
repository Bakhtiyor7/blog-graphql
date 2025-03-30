import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Logger, UseGuards } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.dto';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UpdatePostInput } from './dto/update-post.dto';

@Resolver('posts')
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  private readonly logger = new Logger(PostsResolver.name);

  @Query(() => [Post])
  async getPosts(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<Post[]> {
    try {
      this.logger.log('Entering getPosts resolver method');
      return this.postsService.findAll({ skip, take });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Query(() => Post)
  async getPost(@Args('id', { type: () => Int }) id: number): Promise<Post> {
    this.logger.log(
      'Entering getPosts resolver method, fetching post with id:',
      id,
    );

    return this.postsService.findOne(id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post)
  async createPost(@Args('input') input: CreatePostInput): Promise<Post> {
    this.logger.log('Entering createPost resolver method');
    return this.postsService.create(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post)
  async updatePost(@Args('input') input: UpdatePostInput): Promise<Post> {
    this.logger.log('Entering update post resolver method');
    return this.postsService.update(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post)
  async deletePost(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    try {
      this.logger.log('Entering delete post resolver method');
      return this.postsService.remove(id);
    } catch (e) {
      console.log(e);
    }
  }
}
