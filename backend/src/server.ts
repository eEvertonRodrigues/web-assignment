import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUi from 'swagger-ui-express';

import { ToolsController } from './controllers/ToolsController';
import { CitiesController } from './controllers/CitiesController';
import { AddressController } from './controllers/AddressController';
import { WorkersController } from './controllers/WorkersController';
import { ClientsController } from './controllers/ClientsController';
import { ServicesController } from './controllers/ServicesController';
import { ReportsController } from './controllers/ReportsController';

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors());

const routingControllersOptions = {
  controllers: [ToolsController, CitiesController, AddressController, WorkersController, ClientsController, ServicesController, ReportsController],
  routePrefix: '/api'
};

useExpressServer(app, routingControllersOptions);

const storage = getMetadataArgsStorage();
const spec = routingControllersToSpec(storage, routingControllersOptions, {
  components: {
    schemas: {},
  },
  info: {
    description: 'API Documentation for the Mining Management System',
    title: 'Mining API',
    version: '1.0.0',
  },
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger UI is available at http://localhost:${PORT}/docs`);
});
