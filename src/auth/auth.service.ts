import { faker } from '@faker-js/faker';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthDto } from './dto/auth.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto);

		const tokens = this.issueTokens(user.id);

		return {
			user: this.returnUserFields(user),
			...tokens
		};
	}

	async getNewTokens(refreshToken: string) {
		const result: { id: string } = await this.jwt.verifyAsync(refreshToken);
		if (!result) throw new UnauthorizedException('Invalid refresh token');

		const user = await this.prisma.user.findUnique({
			where: {
				id: result.id
			}
		});
		if (!user) throw new NotFoundException('User not found');

		const tokens = this.issueTokens(user.id);

		return {
			user: this.returnUserFields(user),
			...tokens
		};
	}

	async register(dto: AuthDto) {
		const oldUser = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		});

		if (oldUser) throw new BadRequestException('User already existed');

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				name: faker.person.firstName(),
				avatarPath: faker.image.avatar(),
				phone: faker.phone.number(),
				password: await hash(dto.password)
			}
		});

		const tokens = this.issueTokens(user.id);

		return {
			user: this.returnUserFields(user),
			...tokens
		};
	}

	private issueTokens(userId: string) {
		const data = { id: userId };

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		});

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		});

		return { accessToken, refreshToken };
	}

	private returnUserFields(user: User) {
		return {
			id: user.id,
			email: user.email
		};
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		});

		if (!user) throw new NotFoundException('User not found');

		const isValid = await verify(user.password, dto.password);
		if (!isValid) throw new UnauthorizedException('Invalid password');

		return user;
	}
}
