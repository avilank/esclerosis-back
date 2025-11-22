import { IsString, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'El email no es válido' })
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    password: string;
}