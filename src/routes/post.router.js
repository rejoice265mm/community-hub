import express from "express";
import authMiddeware from "../middlewares/auth.middeware.js";
import {prisma} from '../utils/prisma/index.js'

const router = express.Router();


//게시글 생성 API//      //게시글을 작성하는 클라이언트가 로그인된 사용자인지 authMiddeware에서 확인
router.post('/posts', authMiddeware,async(req, res, next)=>{

    const {userId} = req.user;

    const {title , content} = req.body;

    const post = await prisma.posts.create({
        data:{
            UserId : userId,
            title,
            content,
        }
    });
    return res.status(201).json({data : post});
});


//게시글 목록조회 API//
router.get('/posts', async(req, res, next)=>{
    const posts = await prisma.posts.findMany({
        select:{
            postId : true,
            title : true,
            createdAt : true,
            updatedAt : true,
        },
        orderBy:{
            createdAt : 'desc'  //날짜 순으로 내림차순으로 정렬   오름차순이면 'asc'
        }
    });
    return res.status(200).json({data : posts});
});

//게시글 상세조회 API//
router.get('/posts/:postId', async(req , res, next)=>{
    const {postId} = req.params;
    const post = await prisma.posts.findFirst({
        where: {postId : +postId},
        select:{
            postId : true,
            title : true,
            content : true,
            createdAt : true,
            updatedAt : true, 
        }
    });
    return res.status(200).json({data : post});
});
export default router; 