import { express_app } from "./app.js"
import { config } from "dotenv"

config({
    path:"./.env"
})


// @ts-ignore
const PORT = parseInt(process.env.PORT) 

new express_app().app.listen(PORT || 4000, "0.0.0.0" , ()=>{
    console.log("server start at :" , PORT);
})