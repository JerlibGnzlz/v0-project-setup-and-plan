import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    credentials: true,
  })

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`🚀 Backend API running on http://localhost:${port}`)
}
bootstrap()
