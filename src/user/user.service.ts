import { Injectable } from '@nestjs/common'
import { User } from './entity/user.entity'
import { CreateUserInput } from './dto/create-user.input'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class UserService {
    constructor(
        // private usersRepository: Repository<User>,
        private prisma: PrismaService
    ) {}

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany()
    }

    async findOneByUsername(username: string): Promise<User | undefined> {
        return this.prisma.user.findUnique({ where: { username } })
    }

    async findOneByEmail(email: string): Promise<User | undefined> {
        return this.prisma.user.findUnique({ where: { email } })
    }

    async create(createUserInput: CreateUserInput): Promise<User> {
        const exists = await this.prisma.user.findUnique({
            where: { email: createUserInput.email },
        })

        if (exists) {
            throw new Error('User with this email already exists')
        }
        const hashedPassword = await bcrypt.hash(createUserInput.password, 10)
        return this.prisma.user.create({
            data: {
                ...createUserInput,
                password: hashedPassword,
            },
        })
    }
}
