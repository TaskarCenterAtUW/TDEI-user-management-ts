
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { IController } from "./controller/interface/controller-interface";
import helmet from "helmet";
import { Core } from "nodets-ms-core";
import { errorHandler } from "./middleware/error-handler-middleware";
import { unhandledExceptionAndRejectionHandler } from "./middleware/unhandled-exception-rejection-handler";
import swaggerUi from "swagger-ui-express";
import dbClient from "./database/data-source";
import swaggerDocument from "./assets/user-management-spec.json";
// const swaggerDocument = require('./assets/user-management-spec.json');

class App {
    public app: express.Application;
    public port: number;
    public router = express.Router();

    constructor(controllers: IController[], port: number) {
        this.port = port;
        this.app = express();
        //First middleware to be registered: after express init
        unhandledExceptionAndRejectionHandler();

        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeLibraries();
        this.initializeSwagger();
        dbClient.initializaDatabse();
        //Last middleware to be registered: error handler. 
        this.app.use(errorHandler);
    }

    initializeSwagger() {
        var options = {
            explorer: false
        };

        this.app.get("/api-docs/swagger.json", (req, res) => res.json(swaggerDocument));
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
        this.app.get('/', function (req, res) {
            // On getting the home route request,
            // the user will be redirected to api docs
            res.redirect('/api-docs');
        });
    }

    initializeLibraries() {
        Core.initialize();
    }

    private initializeMiddlewares() {
        this.app.use(helmet());
        this.app.use(bodyParser.json());
        this.app.use(cors());
    }

    private initializeControllers(controllers: IController[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}

export default App;


