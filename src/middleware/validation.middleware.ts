import type { Request, Response, NextFunction } from 'express';

export const fetchUserValidate= (req:Request,res:Response,next:NextFunction):void=>{
    next();
    return ;
}