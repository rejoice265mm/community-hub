import express from "express";
import authMiddeware from "../middlewares/auth.middeware.js";
import {prisma} from '../utils/prisma/index.js'


const router = express.Router();


//댓글 생성 API//
router.post('/posts/:postId/comments',authMiddeware,  async(req, res, next)=>{

    //댓글을 사용하려는 클라이언트가 로그인된 사용자인지 authMiddeware에 있는 user에서 확인
    const {userId} = req.user

    const {postId} = req.params; 

    const {content} = req.body;

    const post = await prisma.posts.findFirst({where:{postId : +postId} })
    if(!post){
        return res.status(404).json({errorMessage: '게시글이 존재하지 않습니다. '});
    }


    //Comments 댓글 생성 
    const comment = await prisma.comments.create({
        data:{
            content,
            UserId : +userId,
            PostId : +postId,
        }
    });
    return res.status(201).json({data : comment});
});

//댓글 조회 API//
router.get('/posts/:postId/comments', async(req, res, next)=>{
    const {postId} = req.params;

     const post = await prisma.posts.findFirst({
        where:{   postId : +postId  }
     });
     if(!post){
        return res.status(404).json({errorMessage : '게시글이 존재하지 않습니다.'})
     }

    const comments = await prisma.comments.findMany({
        where:{PostId : +postId}, 
        orderBy :  {createdAt : 'desc'}, 
    });
    return res.status(200).json({data:comments }) 
})
export default router;