import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import router from "./router/index.route.js"


class express_server {
    app = express()
    constructor(){
        this.app.use(cors({
            origin:"*"
        }))
        this.app.use(express.json())
        this.app.use(bodyParser.json())
        this.app.use("/api/workflow",router);
    }
}


export default express_server;