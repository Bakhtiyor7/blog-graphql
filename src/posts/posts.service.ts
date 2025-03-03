import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.dto';
import { UpdatePostInput } from './dto/update-post.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(PostsService.name);

  async findAll(): Promise<Post[]> {
    const post = await this.prisma.post.findMany({
      include: { category: true, tags: true, comments: true },
    });
    console.log('post:', post);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findOne(id: number): Promise<Post> {
    this.logger.log('Entering findOne PostService method');

    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { category: true, tags: true, comments: true },
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  async create(input: CreatePostInput): Promise<Post> {
    const { title, content, author, categoryName, tags } = input;

    // Handle category (find or create by name, if provided)
    let categoryId: number | undefined;
    if (categoryName) {
      const category = await this.prisma.category.upsert({
        where: { name: categoryName },
        create: { name: categoryName },
        update: {},
      });
      categoryId = category.id;
    }

    // Handle tags (find or create, then connect)
    const tagIds: number[] = [];
    if (tags && tags.length > 0) {
      for (const tagInput of tags) {
        const tag = await this.prisma.tag.upsert({
          where: { name: tagInput.name },
          create: { name: tagInput.name },
          update: {},
        });
        tagIds.push(tag.id);
      }
    }

    // Create the post and connect the category and tags
    return this.prisma.post.create({
      data: {
        title,
        content,
        author,
        categoryId, // Connect to category if provided
        tags: {
          connect: tagIds.map((id) => ({ id })), // Connect existing or newly created tags
        },
      },
      include: { category: true, tags: true, comments: true }, // Include related data in the response
    });
  }

  async update(input: UpdatePostInput): Promise<Post> {
    const { id, title, content, author, categoryName, tags } = input;
    const post = await this.prisma.post.findUnique({
      where: { id: id },
      include: { category: true, tags: true, comments: true },
    });
    console.log('post:', post.title);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    // Update simple fields if provided
    const data: any = {};
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (author !== undefined) post.author = author;

    // Update category if provided
    if (categoryName) {
      const category = await this.prisma.category.findUnique({
        where: { name: categoryName },
      });
      if (!category) {
        throw new BadRequestException(
          `Category '${categoryName}' does not exist.`,
        );
      }
      post.category = category;
    }

    // Update tags if provided
    if (tags && tags.length > 0) {
      const tagIds: number[] = [];
      for (const tagInput of tags) {
        const tag = await this.prisma.tag.upsert({
          where: { name: tagInput.name }, // Adjust based on whether name is unique or use Option 2 from previous response
          create: { name: tagInput.name },
          update: {},
        });
        tagIds.push(tag.id);
      }
      data.tags = { connect: tagIds.map((id) => ({ id })) }; // Connect existing or newly created tags
    }

    return this.prisma.post.update({
      where: { id },
      data,
      include: { category: true, tags: true, comments: true },
    });
  }

  async remove(id: number): Promise<boolean> {
    try {
      // Attempt to delete the post by its ID
      await this.prisma.post.delete({
        where: { id },
      });
      return true; // Indicate success
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma error for "Record not found"
        throw new NotFoundException(`Post with id ${id} not found`);
      }
      throw error; // Re-throw other errors
    }
  }
}
