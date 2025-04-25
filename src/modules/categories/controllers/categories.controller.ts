import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RequestWithUser } from '../../../shared/interfaces/request.interface';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Category name or slug already exists',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: RequestWithUser,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all categories',
    type: [Category],
  })
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a category by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Category slug',
    example: 'healthcare-management',
  })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOneBySlug(@Param('slug', new ParseUUIDPipe()) slug: string): Promise<Category> {
    return this.categoriesService.findOneBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Category name or slug already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: RequestWithUser,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    return this.categoriesService.remove(id, req.user.userId);
  }
} 