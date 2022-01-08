require("dotenv").config();
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // return unauthenticated if theres no token
  if (token == null) return res.sendStatus(401);

  // verify token and get associated user
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    //unauthorised
    if (err) {
      return res.send(403);
    }
    // set user object if authenticated
    req.user = user;
    next();
  });
}

//helpers
function createJWT({ identifier, name }) {
  return jwt.sign({ identifier, name }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

module.exports = { verifyToken, createJWT };
