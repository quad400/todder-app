import { IsEnum, IsNotEmpty, IsString } from "class-validator";
// import { UserRole } from "../../user/user.interface";

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  notificationToken: string;

  // @IsEnum(UserRole)
  // role: UserRole;

  @IsString()
  accessToken: string;
}
