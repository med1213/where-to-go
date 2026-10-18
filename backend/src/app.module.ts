import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PlacesModule } from './modules/places/places.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProvincesModule } from './modules/provinces/provinces.module';
import { UploadModule } from './modules/upload/upload.module';
import { BannersModule } from './modules/banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AuthModule,
    UploadModule,
    CategoriesModule,
    ProvincesModule,
    PlacesModule,
    CommentsModule,
    FavoritesModule,
    AdminModule,
    BannersModule,
  ],
})
export class AppModule {}
