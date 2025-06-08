import { Controller, Get, Inject, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Auth } from "./modules/auth/decorators/auth.decorator";
import { RoleNamesEnum } from "./modules/roles/enums/role-names.enum";

@ApiTags("System")
@Controller()
export class AppController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @ApiOperation({ summary: "Check server status" })
  @ApiOkResponse({
    description: "Server is working!",
  })
  @Get("status")
  getStatus(): string {
    return "OK";
  }

  @ApiOperation({ summary: "Drop all cache" })
  @ApiOkResponse({
    description: "Cache dropped",
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Post("drop-cache")
  async dropAllCache() {
    await this.cacheManager.clear();
    return;
  }
}
