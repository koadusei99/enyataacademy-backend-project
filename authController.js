const { append } = require("express/lib/response")


const getUserInfo = (req, res)=>{
    const {email, firstName, lastName, password} = req.body
    const user = {email, firstName, lastName, password}
    const token = "asdjaskdgasjdfasjdfasjd"
    res.json({user, token})
   
}


module.exports = {getUserInfo}