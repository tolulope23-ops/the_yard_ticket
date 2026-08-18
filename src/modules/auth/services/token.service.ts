import { Injectable } from "@nestjs/common";
import * as crypto from 'crypto';

@Injectable()
export class TokenService{
    constructor(){}
    /**
     * Generate token using crypto and return the raw and hashed token for verification and refresh token
    */
    generateToken(){
        const rawToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken).digest('hex');

        return { rawToken, hashedToken };
    };

    /*
    * method to hash incoming rawtoken
    */
    hashToken(token: string){
        const hashToken = crypto
        .createHash('sha256')
        .update(token).digest('hex');

        return hashToken;
    };

    generateCode(length = 4){
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;

        const rawCode = crypto.randomInt(min, max + 1).toString();
        const hashedCode = crypto.createHash('sha256')
        .update(rawCode)
        .digest('hex');

        return{ rawCode, hashedCode };
    };
};