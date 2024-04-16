import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routes/users.router.js"
import PostRoutrer from "./routes/post.router.js"
import logMiddleware from "./middlewares/log.middleware.js";
import errorHandingMiddleware from "./middlewares/error-handing.middleware.js";

const app = express();
const PORT = 3018;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use('/api',[UsersRouter,PostRoutrer]);
app.use(errorHandingMiddleware);  //에러처리 미드웨어는 가장 마지막에 하는 것이 좋다.
 
app.listen(PORT,()=>{
    console.log(PORT,'포트로 서버가 열렸습니다');
});