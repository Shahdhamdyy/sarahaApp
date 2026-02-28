
import { BadRequestException } from "../../common/utils/response/index.js"

export const validation =(schema)=>{
    return (req,res,next)=>{
      let {value,error}=schema.validate(req.body,{abortEarly:false})
        if(error){
            throw BadRequestException({message:"Validation Error",extra:error})
        }
        next()
    }
}