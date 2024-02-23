import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { type Request, type Response, type NextFunction } from 'express'
import 'dotenv/config'
import Logging from '../library/Logging'

/**
 * Middleware to verify the token before accessing the database routes
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */

const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): Response<any, Record<string, any>> | undefined => {
  // Check if the token is provided in authorization header
  // If not, return 403 status code with the message
  if (
    req.headers.authorization === null ||
    req.headers.authorization === undefined
  ) {
    return res
      .status(403)
      .json({ success: false, message: 'No token provided' })
  }
  // Check if the token starts with 'Bearer '
  if (!req.headers.authorization.toString().startsWith('Bearer ')) {
    return res
      .status(403)
      .json({ success: false, message: "Should start with 'Bearer '" })
  }
  // Extract the token from the authorization header
  const token = req.headers.authorization.toString().replace('Bearer ', '')
  if (token === null || token === undefined) {
    return res
      .status(403)
      .json({ success: false, message: 'No token provided' })
  }
  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'keyboard cat')
    Logging.warn(decoded)
    // If the token is valid, call the next middleware
    if (decoded !== null && typeof decoded === 'object') {
      next()
      return undefined
    } else {
      // If the token is invalid, return 403 status code with the message
      return res.status(403).json({ success: false, message: 'Invalid token' })
    }
  } catch (e: JsonWebTokenError | any) {
    // if we find a JsonWebTokenError, it means the token is invalid
    if (e instanceof JsonWebTokenError) {
      Logging.error(e.message)
      return res.status(403).json({
        success: false,
        message:
          // if the error is 'jwt expired', return alert the user that the token expired
          e.message === 'jwt expired'
            ? 'Token expired, please create new token'
            : 'Invalid token'
      })
    }
    Logging.error(e)
    return res.status(500).json({ success: false, message: e })
  }
}

export default verifyToken
