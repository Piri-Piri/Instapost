const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Token: 'Bearer xjSjPdsDifjdilsjfisdjhUuIdhFFa'
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, 'aSuperDuperSecretToBeReplaced');
    // add token info to the request
    req.userData = { email: decodedToken.email, userId: decodedToken.userId }
    next();
  } catch (error) {
    res.status(401).json({ message: 'You are not authentificated!' });
  }
}
