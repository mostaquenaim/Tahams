"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(session({
        secret: 'my-secret',
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: parseInt(process.env.SESSION_MAX_AGE),
        },
    }));
    app.enableCors({
        origin: ['http://localhost:8000', 'https://tahamsbd.com'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map