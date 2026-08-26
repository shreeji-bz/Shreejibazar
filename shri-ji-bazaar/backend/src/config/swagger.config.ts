import swaggerJsDoc from 'swagger-jsdoc';
import { config } from './app.config';

const swaggerOptions: swaggerJsDoc.SwaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shri Ji Bazaar API',
      version: '1.0.0',
      description: 'API documentation for Shri Ji Bazaar',
    },
    servers: [{ url: `http://localhost:${config.port}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJsDoc(swaggerOptions);