import { IsString, IsNotEmpty, IsInt, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    chatId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    age: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsInt()
    regionId: number;

    @IsInt()
    districtId: number;
}