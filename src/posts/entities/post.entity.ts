import { Field, ObjectType } from '@nestjs/graphql'
import { Comment } from './comment.entity'
import { User as UserGQL } from 'src/user/entity/user.entity'

@ObjectType()
export class Tag {
    @Field()
    id: number

    @Field()
    name: string
}

@ObjectType()
export class Category {
    @Field()
    id: number

    @Field()
    name: string
}

@ObjectType()
export class Post {
    @Field()
    id: number

    @Field()
    title: string

    @Field()
    content: string

    @Field()
    author: string

    @Field()
    createdAt: Date

    @Field()
    updatedAt: Date

    @Field({ nullable: true })
    image?: string

    @Field(() => Category, { nullable: true })
    category: Category

    @Field(() => [Tag], { nullable: true })
    tags: Tag[]

    @Field(() => [Comment], { nullable: true })
    comments: Comment[]

    @Field(() => UserGQL, { nullable: true })
    user?: UserGQL
}

@ObjectType()
export class PostEdge {
    @Field(() => Post)
    node: Post

    @Field()
    cursor: string
}

@ObjectType()
export class PageInfo {
    @Field({ nullable: true })
    endCursor?: string

    @Field()
    hasNextPage: boolean
}

@ObjectType()
export class PostConnection {
    @Field(() => [PostEdge])
    edges: PostEdge[]

    @Field(() => PageInfo)
    pageInfo: PageInfo
}
