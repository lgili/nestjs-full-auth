import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'minLength-{"ln":2,"count":2}',
  })
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}',
  })
  name: string;

  @ValidateIf((object, value) => value)
  @IsString()
  description: string;

  @ValidateIf((object, value) => value)
  @IsNumber(
    {},
    {
      each: true,
      message: 'should be array of numbers',
    },
  )
  permissions: PermissionEntity[];
}
