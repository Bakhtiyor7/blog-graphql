import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostInput } from './dto/create-post.dto';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { UpdatePostInput } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  private readonly logger = new Logger(PostsService.name);

  async findAll(): Promise<Post[]> {
    const post = await this.postRepository.find();
    console.log('post:', post);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findOne(id: number): Promise<Post> {
    this.logger.log('Entering findOne PostService method');

    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  async create(input: CreatePostInput): Promise<Post> {
    const { title, content, author, categoryName, tags } = input;

    const tagEntities: Tag[] = [];

    if (input.tags && input.tags.length > 0) {
      for (const tagInput of input.tags) {
        let tag = await this.tagRepository.findOne({
          where: { name: tagInput.name },
        });

        if (!tag) {
          tag = this.tagRepository.create({ name: tagInput.name });
          await this.tagRepository.save(tag);
        }

        tagEntities.push(tag);
      }
    }

    const category = await this.categoryRepository.findOne({
      where: { name: categoryName },
    });
    if (!category) {
      throw new BadRequestException(
        `Category '${categoryName}' does not exist.`,
      );
    }

    const post = this.postRepository.create({
      title,
      content,
      author,
      category,
      tags: tagEntities,
    });
    return this.postRepository.save(post);
  }

  async update(input: UpdatePostInput): Promise<Post> {
    const { id, title, content, author, categoryName, tags } = input;
    const post = await this.postRepository.findOne({ where: { id: id } });
    console.log('post:', post.title);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    // Update simple fields if provided
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (author !== undefined) post.author = author;

    // Update category if provided
    if (categoryName) {
      const category = await this.categoryRepository.findOne({
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
      const tagEntities: Tag[] = [];
      for (const tagInput of tags) {
        let tag = await this.tagRepository.findOne({
          where: { name: tagInput.name },
        });
        if (!tag) {
          tag = this.tagRepository.create({ name: tagInput.name });
          await this.tagRepository.save(tag);
        }
        tagEntities.push(tag);
      }
      post.tags = tagEntities;
    }

    return this.postRepository.save(post);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.postRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return true;
  }
}
