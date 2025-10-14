// src/posts/posts.resolver.ts

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { Post as PostGQL, PostConnection } from './entities/post.entity'
import { PostsService } from './posts.service'
import { CreatePostInput } from './dto/create-post.dto'
import { UpdatePostInput } from './dto/update-post.dto'
import { GqlAuthGuard } from '../auth/gql-auth.guard'
import { UseGuards, Logger } from '@nestjs/common'

@Resolver(() => PostGQL)
export class PostsResolver {
    private readonly logger = new Logger(PostsResolver.name)

    constructor(private readonly postsService: PostsService) {}

    @Query(() => PostConnection, { name: 'getPosts' })
    async getPosts(
        @Args('first', { type: () => Int, nullable: true, defaultValue: 10 })
        first: number,
        @Args('after', { type: () => String, nullable: true }) after?: string,
        @Args('categoryName', { type: () => String, nullable: true })
        categoryName?: string
    ): Promise<PostConnection> {
        this.logger.log(`getPosts (category=${categoryName ?? 'ALL'})`)
        return this.postsService.findAll({ first, after, categoryName })
    }

    @Query(() => PostGQL, { name: 'getPost', nullable: true })
    async getPost(
        @Args('id', { type: () => Int }) id: number
    ): Promise<PostGQL> {
        return this.postsService.findOne(id)
    }

    @UseGuards(GqlAuthGuard)
    @Mutation(() => PostGQL, { name: 'createPost' })
    async createPost(@Args('input') input: CreatePostInput): Promise<PostGQL> {
        this.logger.log('createPost')
        return this.postsService.create(input)
    }

    @UseGuards(GqlAuthGuard)
    @Mutation(() => PostGQL, { name: 'updatePost' })
    async updatePost(@Args('input') input: UpdatePostInput): Promise<PostGQL> {
        this.logger.log('updatePost')
        return this.postsService.update(input)
    }

    @UseGuards(GqlAuthGuard)
    @Mutation(() => Boolean, { name: 'deletePost' })
    async deletePost(
        @Args('id', { type: () => Int }) id: number
    ): Promise<boolean> {
        this.logger.log('deletePost')
        return this.postsService.remove(id)
    }
}
