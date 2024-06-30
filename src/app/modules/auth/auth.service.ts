import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TLoginUser, TUser } from "./auth.interface";
import { User } from "./auth.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUserIntoDB = async (payload: TUser) => {
  const result = await User.create(payload);
  return result;
};

const loginUserFromDB = async (payload: TLoginUser) => {
  const isUserExist = await User.findOne({ email: payload.email }).select(
    "+password"
  );
  //check if a user with this email
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found with this email!");
  }

  //compare password using bcrypt
  const isPasswordMatch = bcrypt.compare(
    payload?.password,
    isUserExist?.password
  );

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect!");
  }

  //generate access token
  const jwtPayload = {
    email: isUserExist?.email,
    role: isUserExist?.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret, {
    expiresIn: "10d",
  });
};

export const UserServices = {
  createUserIntoDB,
  loginUserFromDB,
};
