import { prisma } from "../utils/prisma/index.js";

//사용자 인증 미들웨어: jwt로 사용자를 조회하도록 구현할 코드
export default async function(req, res, next){
    try{
    //     //사용자로 부터 쿠키를 받아온다.
    // const {authorization} = req.cookies;

    // //쿠키가 Bearer 토큰 형식인지 확인
    // const [tokenType, token] = authorization.split(' '); // 어떤 코드??
    // if(tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.')

    // //서버에 발급한 jwt가 맞는지 검증
    // const decodedToken = jwt.verify(token,'customized_secret_key')   //verify = 검증한다 라는 뜻]
    // const userId = decodedToken.userId;
    //리펙토링
    const {userId} = req.session;
    if(!userId) throw new Error('로그인이 필요합니다.')

    //jwt의 userId를 이용해 사용자 조회
    const user = await prisma.users.findFirst({
        where: {userId: +userId },
    })
    if(!user){
        throw new Error('토큰 사용자가 존재하지 않습니다.')
    }
    
    //조회된 사용자 정보 req.user에 할당
    req.user = user;

    //미드웨어 실행
    next();

    }catch(error){
        switch(error.name){
        default: 
         return res.status(401).json({message: error.message?? '비정상적인 요청입니다.'});  
        }
    }
}