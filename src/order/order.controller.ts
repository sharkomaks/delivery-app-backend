import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { OrderDto } from './dto/order.dto';

@Controller('orders')
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@Get()
	@Auth()
	async getAll() {
		return this.orderService.getAll();
	}

	@Get('by-user')
	@Auth()
	async getByUserId(@CurrentUser('id') userId: string) {
		return this.orderService.getByUserId(userId);
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@Auth()
	async placeOrder(@Body() dto: OrderDto, @CurrentUser('id') userId: string) {
		return this.orderService.placeOrder(dto, userId);
	}
}
