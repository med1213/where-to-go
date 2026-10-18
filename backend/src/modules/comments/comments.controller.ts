import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Comments & Travel Tips')
@Controller('places/:placeId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List approved comments and travel tips for a place' })
  @ApiResponse({ status: 200, description: 'Paginated list of comments' })
  async findByPlace(
    @Param('placeId') placeId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.commentsService.findByPlace(placeId, +page, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @Post()
  @ApiOperation({ summary: 'Add a comment / review to a place (requires login)' })
  @ApiResponse({ status: 201, description: 'Comment created' })
  async create(
    @Param('placeId') placeId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(placeId, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-PS512')
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a comment (author or admin only)' })
  async softDelete(
    @Param('id') commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.commentsService.softDelete(commentId, userId, role);
  }
}
