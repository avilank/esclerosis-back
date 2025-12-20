import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  username: string;
}
