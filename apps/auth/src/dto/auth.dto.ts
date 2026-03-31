import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'User password',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    description: 'MFA TOTP code if MFA is enabled for the user',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'MFA code must be exactly 6 digits' })
  mfaCode?: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Primary email address for the account',
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Account password',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak. Must contain uppercase, lowercase, and a number or special character.',
  })
  password!: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({
    example: 'My Workspace',
    description: 'Name of the tenant/workspace to create',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  tenantName!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'The valid refresh token' })
  @IsString()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'The reset token received via email' })
  @IsString()
  token!: string;

  @ApiProperty({
    example: 'NewStrongPassword123!',
    description: 'The new password',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak.',
  })
  newPassword!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    example: 'NewStrongPassword123!',
    description: 'The new password',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak.',
  })
  newPassword!: string;
}

export class EnableMfaDto {
  @ApiProperty({ description: 'The 6-digit TOTP code from the authenticator app' })
  @IsString()
  @Matches(/^\d{6}$/)
  totpCode!: string;
}

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'If true, logs out from all active sessions',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allSessions?: boolean;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'The verification token received via email' })
  @IsString()
  token!: string;
}

