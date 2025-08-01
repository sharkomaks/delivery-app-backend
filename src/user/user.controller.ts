import { Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	async getProfile(@CurrentUser('id') id: string) {
		return this.userService.getById(id);
	}

	@Auth()
	@Patch('profile/favorites/:productId')
	async toggleFavorites(@CurrentUser('id') id: string, @Param('productId') productId: string) {
		return this.userService.toggleFavorite(id, productId);
	}
}
