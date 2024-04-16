import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

//사용자 인증 미들웨어: jwt로 사용자를 조회하도록 구현할 코드
export default async function(req, res, next){
    try{
        //사용자로 부터 쿠키를 받아온다.
    const {authorization} = req.cookies;

    //쿠키가 Bearer 토큰 형식인지 확인
    const [tokenType, token] = authorization.split(' '); // 어떤 코드??
    if(tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.')

    //서버에 발급한 jwt가 맞는지 검증
    const decodedToken = jwt.verify(token,'customized_secret_key')   //verify = 검증한다 라는 뜻]
    const userId = decodedToken.userId;

    //jwt의 userId를 이용해 사용자 조회
    const user = await prisma.users.findFirst({
        where: {userId: +userId },
    })
    if(!user){
        res.clearCookie('authorization');
        throw new Error('토큰 사용자가 존재하지 않습니다.')
    }
    
    //조회된 사용자 정보 req.user에 할당
    req.user = user;

    //미드웨어 실행
    next();

    }catch(error){
        res.clearCookie('authorization'); //쿠키 삭제코드
        switch(error.name){
            case 'TokenExpiredError':  //만료된 쿠키일떄 에러
        return res.status(401).json({ message: '토큰이 만료되었습니다.' });
      case 'JsonWebTokenError':  //토큰 검증 실패했을떄 에러
        return res.status(401).json({ message: '토큰이 조작되었습니다.' });
        default: 
         return res.status(401).json({message: error.message?? '비정상적인 요청입니다.'});  
        }
    }
}