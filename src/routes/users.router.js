import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import {prisma} from "../utils/prisma/index.js";
import authMiddeware from "../middlewares/auth.middeware.js";
import { Prisma, PrismaClient } from "@prisma/client";

const router = express.Router();

//사용자 회원가입 API //
router.post('/sign-up',async(req,res,next)=>{
    try{
       
    const {email, password, name, age, gender, profileImage} = req.body;

    //동일한 email이 있는지 확인//
    const isExisUser = await prisma.users.findFirst({
        where: {email},
    });
    if (isExisUser){
        return res.status(409).json({message : '이미 존재하는 이메일 입니다.'});
    }

    //사용자 생성//
    const hashedPassword = await bcrypt.hash(password,10);  

    const [user, userinfo ] = await prisma.$transaction(async(tx)=>{
    const user = await tx.users.create({
        data:{
            email, 
            password : hashedPassword,
        }
    });
    //사용자 정보 생성//
    const userInfo = await tx.userInfos.create({
        data:{
            UserId : user.userId,
            name,
            age,
            gender: gender.toUpperCase(), //전부 대분자로 해준다.
            profileImage,
        }
    });
    return [user , userInfo];
    },{
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    });

    
    return res.status(201).json({message: '회원가입이 되었습니다.'});
}catch(err){
    next(err);
}
});
//사용자  로그인 API// 
router.post('/sign-in',async(req,res,next)=>{
     const {email , password} = req.body;
     
     //전달받은 email에 해당하는 사용자가 있는지 확인
     const user = await prisma.users.findFirst({
        where:{email}
    }); 
    if(!user){
        return res.status(401).json({message: '존재하지 않는 이메일입니다.'})
    }

    //전달받은 비밀번호와 저장된 비밀번호가 맞는지 검증 리펙토링
    //const result = await bcrypt.compare(password, user.password);
    if(!await bcrypt.compare(password, user.password)) {
        return res.status(401).json({message: '비밀번호가 일치하지 않습니다.'})
    }

    //로그인 인증후 사용자에게 쿠키 발급
    req.session.userId = user.userId;
    
    return res.status(200).json({message: '로그인 성공'});
});

//사용자 조회 API//
router.get('/users',authMiddeware, async(req,res,next)=>{
    const {userId} = req.user;
     
     const user = await prisma.users.findFirst({
        where: {userId : +userId},
        //선택한 것만 조회
        select: {
            userId: true,
            email : true,
            createdAt : true,
            updatedAt: true,
            //연관 관계 조회시 중첩 select를 이용해서 사용한다.
            UserInfos:{
                select:{
                name : true,
                age : true,
                gender : true,
                profileImage : true, 
                }
            }
        }
     });
     return res.status(200).json({data: user});
});

//사용자 정보 변경 API//
router.patch('/users',authMiddeware, async(req,res,next)=>{
    //수정전 정보가 맞는지 확인
    const {userId} = req.user;

    const updatedData = req.body;

    const userInfo = await prisma.userInfos.findFirst({
        where: {UserId : + userId},
    })

    await prisma.$transaction(async(tx)=>{
        //사용자 정보 수정
        await tx.userInfos.update({
            data:{
                ...updatedData
            },
            where:{UserId : +userId}
        });

        //변경된 내용을 테이블에 저장
        for (let key in updatedData) {
            //변경이 되었을때
            if (userInfo[key] !== updatedData[key]){
                await tx.userHistories.create({
                    data:{
                        UserId : +userId,
                        changedField : key,
                        oldValue : String(userInfo[key]), //변경 전 데이터 
                        newValue : String(updatedData[key]),  // 변경후 데이터 
                    }
                });
            }
        }
    },{
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    });
    return res.status(200).json({message : '변경이 성공하였습니다.'})
});

export default router; 