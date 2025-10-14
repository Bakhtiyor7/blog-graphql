import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common'
import { Post, PostConnection } from './entities/post.entity'
import { CreatePostInput } from './dto/create-post.dto'
import { UpdatePostInput } from './dto/update-post.dto'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'

type PostWithRelations = Prisma.PostGetPayload<{
    include: { category: true; tags: true; comments: true }
}>

function encodeCursor(id: number): string {
    return Buffer.from(String(id), 'utf8').toString('base64')
}
function decodeCursor(cursor: string): number {
    const s = Buffer.from(cursor, 'base64').toString('utf8')
    const n = Number(s)
    if (!Number.isInteger(n)) throw new BadRequestException('Invalid cursor')
    return n
}

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) {}

    private readonly logger = new Logger(PostsService.name)

    async findAll(args: {
        first: number
        after?: string
        categoryName?: string
    }): Promise<PostConnection> {
        const { first, after, categoryName } = args

        if (first <= 0 || first > 100) {
            throw new BadRequestException('first must be between 1 and 100')
        }

        const where = categoryName
            ? { category: { name: categoryName } }
            : undefined

        // We fetch one extra to know if there's another page.
        const take = first + 1

        const prismaArgs: Parameters<typeof this.prisma.post.findMany>[0] = {
            where,
            orderBy: { id: 'desc' },
            include: { category: true, tags: true, comments: true }, // <-- IMPORTANT
            take,
        }
        if (after) {
            const afterId = decodeCursor(after)
            prismaArgs.cursor = { id: afterId }
            prismaArgs.skip = 1 // exclude the cursor row itself
        }

        const rows = await this.prisma.post.findMany({
            ...prismaArgs,
            include: { category: true, tags: true, comments: true },
        })

        const hasNextPage = rows.length > first
        const slice = hasNextPage ? rows.slice(0, first) : rows

        const edges = slice.map(
            (node): { node: PostWithRelations; cursor: string } => ({
                node,
                cursor: encodeCursor(node.id),
            })
        )

        return {
            edges,
            pageInfo: { endCursor: edges.at(-1)?.cursor ?? null, hasNextPage },
        }
    }

    async findOne(id: number): Promise<Post> {
        this.logger.log('Entering findOne PostService method')

        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { category: true, tags: true, comments: true, user: true },
        })
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`)
        }
        return post
    }

    async create(input: CreatePostInput): Promise<Post> {
        const { title, content, author, categoryName, tags, image } = input

        // Handle category (find or create by name, if provided)

        let categoryId: number | undefined
        if (categoryName) {
            const category = await this.prisma.category.upsert({
                where: { name: categoryName },
                create: { name: categoryName },
                update: {},
            })
            categoryId = category.id
        }

        // Handle tags (find or create, then connect)
        const tagIds: number[] = []
        if (tags && tags.length > 0) {
            for (const tagInput of tags) {
                const tag = await this.prisma.tag.upsert({
                    where: { name: tagInput.name },
                    create: { name: tagInput.name },
                    update: {},
                })
                tagIds.push(tag.id)
            }
        }

        // Create the post and connect the category and tags
        return this.prisma.post.create({
            data: {
                title,
                content,
                author,
                image, // ← persist cover image
                ...(categoryId && { categoryId }),
                tags: {
                    connect: tagIds.map((id) => ({ id })), // Connect existing or newly created tags
                },
            },
            include: { category: true, tags: true, comments: true }, // Include related data in the response
        })
    }

    async update(input: UpdatePostInput): Promise<Post> {
        const { id, title, content, author, categoryName, tags } = input
        const post = await this.prisma.post.findUnique({
            where: { id: id },
            include: { category: true, tags: true, comments: true },
        })

        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`)
        }

        // Update simple fields if provided
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {}
        if (title !== undefined) post.title = title
        if (content !== undefined) post.content = content
        if (author !== undefined) post.author = author

        // Update category if provided
        if (categoryName) {
            const category = await this.prisma.category.findUnique({
                where: { name: categoryName },
            })
            if (!category) {
                throw new BadRequestException(
                    `Category '${categoryName}' does not exist.`
                )
            }
            post.category = category
        }

        // Update tags if provided
        if (tags && tags.length > 0) {
            const tagIds: number[] = []
            for (const tagInput of tags) {
                const tag = await this.prisma.tag.upsert({
                    where: { name: tagInput.name }, // Adjust based on whether name is unique or use Option 2 from previous response
                    create: { name: tagInput.name },
                    update: {},
                })
                tagIds.push(tag.id)
            }
            data.tags = { connect: tagIds.map((id) => ({ id })) } // Connect existing or newly created tags
        }

        return this.prisma.post.update({
            where: { id },
            data,
            include: { category: true, tags: true, comments: true },
        })
    }

    async remove(id: number): Promise<boolean> {
        try {
            // Attempt to delete the post by its ID
            await this.prisma.post.delete({
                where: { id },
            })
            return true // Indicate success
        } catch (error) {
            if (error.code === 'P2025') {
                // Prisma error for "Record not found"
                throw new NotFoundException(`Post with id ${id} not found`)
            }
            throw error // Re-throw other errors
        }
    }
}
