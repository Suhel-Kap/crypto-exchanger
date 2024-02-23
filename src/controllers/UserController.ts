import type { NextFunction, Request, Response } from 'express'
import { insertUser, fetchUser } from '../database'
import Logging from '../library/Logging'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { z } from 'zod'
import { DatabaseError } from 'pg'
import { UserSchema } from '../helper/schemas'

/**
 * All the controllers for the user routes
 * i.e, all requests to /users are handled here
 */

// Register a new user
const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // Validate the input data to be compliant with the schema
    // If the input is not valid, it will throw an error
    const { username, password } = UserSchema.parse(req.body)
    // Insert the user into the database
    await insertUser({ username, password })
    Logging.warn(`User ${username} registered`)
    return res.status(200).json({ success: true, message: 'User registered' })
  } catch (e: z.ZodError | DatabaseError | any) {
    Logging.error(e)
    // If the error is a ZodError, it means the input data is not valid
    // Return a 400 status code with the error message
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: {
          error: e.errors[0].message,
          field: e.errors[0].path
        }
      })
    }
    // If the error is a DatabaseError, it means there was an error with the database
    // Return a 500 status code with the error message
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
      return res.status(500).json({ success: false, message: e.detail })
    }
    return res.status(500).json({ success: false, message: e })
  }
}

// Login a user
const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
  try {
    // extract the username and password from the request body
    const { username, password } = req.body
    // Validate the input data to be compliant with the schema, but only partially
    // If the input is not valid, it will return false
    const isInputValid = UserSchema.partial().safeParse({
      username,
      password
    })
    console.log(isInputValid)
    // If the input is not valid, return a 400 status code with the error message
    if (!isInputValid.success) {
      return res.status(400).json({
        success: false,
        message: {
          error: isInputValid.error.errors[0].message,
          field: isInputValid.error.errors[0].path
        }
      })
    }
    // Check if the user exists and the password is correct
    const isUserValid = await fetchUser(username as string, password as string)
    // if user is not valid, it means user has not been registered
    if (typeof isUserValid === 'boolean' && !isUserValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      })
    }
    // If the user is not valid, return a 401 status code with the error message
    if (typeof isUserValid === 'object' && !isUserValid.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      })
    }
    // if the password is correct, create a JWT token which expires in 1 hour
    // and return it to the user
    if (typeof isUserValid === 'object' && isUserValid.valid) {
      Logging.warn(`User ${username} logged in`)
      // Create a JWT token
      const token = jwt.sign(
        { id: isUserValid.id },
        process.env.JWT_SECRET ?? 'keyboard cat',
        {
          algorithm: 'HS256',
          expiresIn: '1h'
        }
      )
      return res.status(200).json({
        success: true,
        message: 'User logged in',
        data: {
          accessToken: token
        }
      })
    }
    return res.status(200).json({ success: true, message: 'User logged in' })
  } catch (e: DatabaseError | any) {
    if (e instanceof DatabaseError) {
      Logging.error(e.code)
      Logging.error(e.detail)
      Logging.error(e.message)
      return res.status(500).json({ success: false, message: e.detail })
    }
    return res.status(500).json({ success: false, message: e })
  }
}

export default {
  registerUser,
  loginUser
}
