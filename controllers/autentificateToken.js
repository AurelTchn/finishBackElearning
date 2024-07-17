const jwt = require('jsonwebtoken')

exports.authentificateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    if(token == null){
        console.log("Non autoriser")
        return res.status(200).json({error: 'Non autoriser'})
    }

    jwt.verify(token, process.env.TOKEN_FIRST_KEY, (err, data) => {
        if(err){
            return res.status(200).json({error: err.message, message: 'Non autoriser'});
        }else{
            // console.log("token data : ", data)
            req.data = data
            next()
        }
    })
}
