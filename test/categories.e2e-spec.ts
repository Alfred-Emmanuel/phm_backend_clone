import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Category } from '../src/modules/categories/entities/category.entity';
import { CategoryType } from '../src/modules/categories/entities/category.entity';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as admin to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });

    adminToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /categories', () => {
    it('should create a new category (201)', () => {
      const createCategoryDto = {
        name: 'Test Category',
        type: CategoryType.PAID,
        description: 'Test category description',
        slug: 'test-category',
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCategoryDto)
        .expect(201)
        .expect((res) => {
          const category = res.body as Category;
          expect(category).toHaveProperty('id');
          expect(category.name).toBe(createCategoryDto.name);
          expect(category.type).toBe(createCategoryDto.type);
          expect(category.description).toBe(createCategoryDto.description);
          expect(category.slug).toBe(createCategoryDto.slug);
        });
    });

    it('should return 400 when name already exists', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        type: CategoryType.PAID,
        description: 'Test category description',
        slug: 'test-category-2',
      };

      // First create a category
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCategoryDto);

      // Try to create another with same name
      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCategoryDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should return 400 when slug already exists', async () => {
      const createCategoryDto = {
        name: 'Test Category 3',
        type: CategoryType.PAID,
        description: 'Test category description',
        slug: 'test-category-3',
      };

      // First create a category
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCategoryDto);

      // Try to create another with same slug
      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCategoryDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should return 401 when not authenticated', () => {
      const createCategoryDto = {
        name: 'Test Category 4',
        type: CategoryType.PAID,
        description: 'Test category description',
        slug: 'test-category-4',
      };

      return request(app.getHttpServer())
        .post('/categories')
        .send(createCategoryDto)
        .expect(401);
    });

    it('should return 403 when not an admin', async () => {
      // Login as non-admin user
      const loginResponse = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: process.env.USER_EMAIL,
          password: process.env.USER_PASSWORD,
        });

      const userToken = loginResponse.body.accessToken;

      const createCategoryDto = {
        name: 'Test Category 5',
        type: CategoryType.PAID,
        description: 'Test category description',
        slug: 'test-category-5',
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createCategoryDto)
        .expect(403);
    });
  });
}); 