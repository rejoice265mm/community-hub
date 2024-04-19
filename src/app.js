import express from "express";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import expressMySQLSession from "express-mysql-session";
import dotEnv from "dotenv"
import UsersRouter from "./routes/users.router.js"
import PostRouter from "./routes/post.router.js"
import CommentsRouter from './routes/comment.router.js'
import logMiddleware from "./middlewares/log.middleware.js";
import errorHandingMiddleware from "./middlewares/error-handing.middleware.js";

//.env에 있는 여러 값들을, process.env 객체 안에 추가한다.
dotEnv.config();

const app = express();
const PORT = 3018;

const MySQLStorage = expressMySQLSession(expressSession);
const sessionStroe = new MySQLStorage({  //어떤 MySQL을 사용할 것인가?
    user : process.env.DATABASE_USERNAME,
    password : process.env.DATABASE_PASSWORD,
    host : process.env.DATABASE_HOST,
    port : process.env.DATABASE_PORT,
    database : process.env.DATABASE_NAME,
    expiration :1000 * 60 * 60 * 24,
    createDatabaseTable : true,
})

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(expressSession({
        secret : process.env.SESSION_SECRET_KEY,
        resave : false,
        saveUninitialized: false,
        store : sessionStroe,
        cookie:{
            maxAge:1000 * 60 * 60 * 24 // 하루 설정 코드
        }
    }))
app.use('/api',[UsersRouter,PostRouter,CommentsRouter]);
app.use(errorHandingMiddleware);  //에러처리 미드웨어는 가장 마지막에 하는 것이 좋다.
 
app.listen(PORT,()=>{
    console.log(PORT,'포트로 서버가 열렸습니다');
});