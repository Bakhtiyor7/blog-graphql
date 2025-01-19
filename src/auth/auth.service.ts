import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginInput, RegisterInput } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(user: RegisterInput): Promise<User> {
    const { email, password, username } = user;
    // check if user exists
    const userExists = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (userExists) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // create instance
    const userData = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
    });
    // save user instance
    const result = this.userRepository.save(userData);
    // return
    return result;
  }

  async login(user: LoginInput): Promise<{ accessToken: string }> {
    const { email, password } = user;

    const userExists = await this.userRepository.findOne({
      where: { email },
    });

    console.log('userExists', userExists);
    if (!userExists) throw new NotFoundException('Invalid credentials');

    console.log('Stored password:', userExists.password);
    console.log('Entered password:', password);

    // check if password is valid
    const isMatch = await bcrypt.compare(password, userExists.password);

    console.log('ismatch', isMatch);
    if (!isMatch) throw new NotFoundException('Invalid credentials');
    // access token
    const accessToken = this.jwtService.sign({
      userId: userExists.id,
      email: userExists.email,
    });

    return { accessToken };
  }

  async validateUser(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
