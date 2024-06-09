const JWT = require('jsonwebtoken');

const secret="superMan@123";




function createTokenForUser(user){
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageUrl: user. profileImageUrl,
        role:user.role
    };
// console.log(user.payload)

    const token=JWT.sign(payload, secret);
        return token;

}

function validateToken(token) {
    try{
     const payload=JWT.verify(token,secret);
    return payload;   
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}

module.exports = {
    createTokenForUser,
    validateToken,
}