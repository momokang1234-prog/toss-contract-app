import type { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Toss Payment API",
    version: "1.0.0",
    description: "토스 간편 송금 백엔드 API — 회원가입, 로그인, 잔액조회, 송금, 거래내역",
  },
  servers: [
    { url: "http://localhost:3000", description: "Development server" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  // Paths to route files containing OpenAPI JSDoc annotations
  apis: ["./src/routes/*.ts"],
};

let swaggerSpec: object | null = null;

export function getSwaggerSpec(): object {
  if (!swaggerSpec) {
    swaggerSpec = swaggerJSDoc(options);
  }
  return swaggerSpec;
}

export function setupSwagger(app: Express): void {
  const spec = getSwaggerSpec();
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  app.get("/api-docs.json", (_req, res) => {
    res.json(spec);
  });
}
