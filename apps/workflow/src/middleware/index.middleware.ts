import async_handler from "../utils/async_handler.js";
import { api_error } from "../utils/api_error.js";
import { prisma } from "@master/database";
import JWT from "jsonwebtoken"
import { config } from "dotenv";
config()

export const verify_JWT = async_handler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      throw new api_error(401, "Unauthorized request",Error.prototype);
    }
    const  ACCESS_TOKEN =   process.env.ACCESS_TOKEN_SECRET;
    if(!ACCESS_TOKEN){
        throw new api_error(401, "env not exist",Error.prototype);
    }


    const decodedToken = JWT.verify(token,ACCESS_TOKEN);

    const user = await prisma.user.findFirst({
        where:{
            //@ts-ignore
            email:decodedToken?.email
        },
        select:{
            id:true
        }
    })

    if (!user) {
      throw new api_error(401, "Invalid Access Token",Error.prototype);
    }
    // console.log(user);
    // @ts-ignore
    req.user =user

    next();
  } catch (error :any) {
    throw new api_error(401, error?.message || "Invalid access token",Error.prototype);
  }
});
