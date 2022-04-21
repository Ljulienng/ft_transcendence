"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(passport.initialize());
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'static'));
    app.use(cookieParser());
    app.enableCors({
        credentials: true,
        origin: true,
    });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map