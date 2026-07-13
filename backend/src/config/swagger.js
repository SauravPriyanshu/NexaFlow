const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NexaFlow API',
      version: '1.0.0',
      description: 'AI-Powered Collaborative Workspace — REST API Documentation',
      contact: { name: 'NexaFlow Team', email: 'api@nexaflow.dev' }
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Development' },
      { url: 'https://nexaflow-api.onrender.com/api', description: 'Production' }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token. Obtain from POST /auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Alex Johnson' },
            email: { type: 'string', format: 'email', example: 'alex@example.com' },
            avatar: { type: 'string', nullable: true },
            bio: { type: 'string', example: 'Full-stack developer' },
            skills: { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js'] },
            isVerified: { type: 'boolean' },
            theme: { type: 'string', enum: ['light', 'dark', 'system'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Implement Redis caching' },
            description: { type: 'string' },
            projectId: { type: 'string' },
            orgId: { type: 'string' },
            status: { type: 'string', enum: ['todo','in_progress','review','testing','done'] },
            priority: { type: 'string', enum: ['low','medium','high','urgent'] },
            assignees: { type: 'array', items: { $ref: '#/components/schemas/User' } },
            labels: { type: 'array', items: { type: 'string' } },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            order: { type: 'number' },
            checklists: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  text: { type: 'string' },
                  done: { type: 'boolean' }
                }
              }
            },
            commentCount: { type: 'number' },
            attachmentCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid access token',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
        },
        Forbidden: {
          description: 'Insufficient permissions for this action',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
        }
      }
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Organizations', description: 'Organization and member management' },
      { name: 'Projects', description: 'Project management' },
      { name: 'Tasks', description: 'Task and Kanban management' },
      { name: 'Chat', description: 'Real-time messaging' },
      { name: 'Files', description: 'File upload and management' },
      { name: 'Comments', description: 'Task comments' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Search', description: 'Global search' },
      { name: 'Analytics', description: 'Dashboard analytics' },
      { name: 'AI', description: 'AI assistant features' },
      { name: 'Health', description: 'System health check' }
    ]
  },
  apis: ['./src/modules/**/*.routes.js', './src/app.js']
}

module.exports = { swaggerSpec: swaggerJsdoc(options) };
