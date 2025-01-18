import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostInput } from './dto/create-post.dto';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';

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
  async findAll(): Promise<Post[]> {
    const post = await this.postRepository.find();
    console.log('post:', post);
    if (!post) {
      throw new NotFoundException('Post not found');
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
}
