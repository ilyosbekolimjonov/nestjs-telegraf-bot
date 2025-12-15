import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async isUserRegistered(telegramId: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { chatId: BigInt(telegramId) },
        });
        return !!user;
    }

    async createUser(dto: CreateUserDto) {
        return this.prisma.user.create({
            data: {
                chatId: BigInt(dto.chatId),
                name: dto.name,
                age: dto.age,
                phone: dto.phone,
                regionId: dto.regionId,
                districtId: dto.districtId,
            },
        });
    }
}