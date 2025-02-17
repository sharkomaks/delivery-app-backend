import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('categories')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	async getAll() {
		return this.categoryService.getAll();
	}

	@Get('by-id/:id')
	async getById(@Param('id') id: string) {
		return this.categoryService.getById(id);
	}

	@Get('by-slug/:slug')
	async getBySlug(@Param('slug') slug: string) {
		return this.categoryService.getBySlug(slug);
	}

	@Post()
	@Auth()
	async create() {
		return this.categoryService.create();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@Auth()
	async update(@Param('id') id: string, @Body() dto: CategoryDto) {
		return this.categoryService.update(id, dto);
	}

	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.categoryService.delete(id);
	}
}
