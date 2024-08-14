import { JwtPayload } from "jsonwebtoken";
import { TRental } from "./rental.interface";
import mongoose, { Types } from "mongoose";
import { User } from "../auth/auth.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { Rental } from "./rental.model";
import { Bike } from "../bikes/bike.model";

const createRentalIntoDB = async (payload: TRental, decodInfo: JwtPayload) => {
  const { email, role } = decodInfo;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const user = await User.findOne({ email, role });
    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User is not authorized");
    }

    const userId = user._id as Types.ObjectId;
    payload.userId = userId;

    const result = await Rental.create([payload], { session });

    await Bike.findOneAndUpdate(
      { _id: payload.bikeId },
      { isAvailable: false },
      { new: true, session }
    );

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
  } finally {
    session.endSession();
  }
};

export const RentalServices = {
  createRentalIntoDB,
};
