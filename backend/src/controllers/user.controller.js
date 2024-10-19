import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import  ApiResponse  from '../utils/ApiResponse.js';
import prisma from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import fs from "fs"
import path from 'path';

export const register = async (req, res, next) => {
  // Trim the incoming username, email, and password
  const username = req.body.username?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();


  if (!username || !email || !password) {
    return next(new ApiError(400, "All fields are required!"));
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
    },
  });

  if (existingUser) {
    let errorMessage = "User with this ";
    if (existingUser.email === email) {
      errorMessage += "email already exists.";
    } else if (existingUser.username === username) {
      errorMessage += "username already exists.";
    }
    return next(new ApiError(400, errorMessage));
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username: username,
    },
  });

  const token = jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username,
  }, process.env.JWT_SECRET, { expiresIn: '7d' });
 
  const data = {
    id: user.id,
    email: user.email,
    username: user.username,
    profilePicture: user.profilePicture,
    about: user.about
  }

  return res.status(200).json(new ApiResponse(200, {data, token} ,"User registered successfully"));
};

export const login = async (req, res, next) => {
  // Trim the incoming email and password
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  if (!email || !password) {
    return next(new ApiError(400, "All fields are required!"));
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return next(new ApiError(400, "User does not exist!"));
  }

  // Check if password is correct
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return next(new ApiError(400, "Invalid password!"));
  }

  const data = {
    id: user.id,
    email: user.email,
    username: user.username,
    profilePicture: user.profilePicture,
    about: user.about
  }
  return res.status(200).json(new ApiResponse(200, data, "User logged in successfully"));
};

// update profile 
export const updateProfile = async (req, res, next) => {

  const id = req.user.id;
  const about = req.body.about?.trim();
  const username = req.body.username?.trim();

  // If a profile picture was uploaded, store its path
  const newProfilePicture = req.file ? req.file.path : "";


  // Fetch the current user's data to check for existing profile picture
  const existingUser = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingUser) {
    return next(new ApiError(404, 'User not found'));
  }

  // If a username is provided, check if it's already taken
  if (username) {
    const usernameTaken = await prisma.user.findUnique({
      where: { username },
    });

    if (usernameTaken && usernameTaken.id !== parseInt(id)) {
      return next(new ApiError(400, 'Username is already taken'));
    }
  }

  // Handle removal of previous profile picture if a new one is uploaded
  if (newProfilePicture && existingUser.profilePicture) {
    const oldProfilePicturePath = existingUser.profilePicture;

    const filePath = path.resolve(oldProfilePicturePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Create an update object dynamically
  const updateData = {};

  if (about) updateData.about = about;
  if (username) updateData.username = username;
  if (newProfilePicture) updateData.profilePicture = newProfilePicture;

  // if at least one field is being updated
  if (Object.keys(updateData).length === 0) {
    return next(new ApiError(400, 'No data to update'));
  }


  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: updateData
  });

  const data = {
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    profilePicture: updatedUser.profilePicture,
    about: updatedUser.about
  }
  return res.status(200).json(new ApiResponse(200, data, "Update successfully"));
};


// for remove profile
export const removeProfilePicture = async (req, res, next) => {
  const id = req.user.id;
  const { url } = req.query;

  if (!url) {
    return next(new ApiError(400, 'Profile picture URL not provided'));
  }

  // Update the user to remove the profile picture
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { profilePicture: "" },
  });

  // Delete the file from the server
  const filePath = path.resolve(url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const data = {
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    profilePicture: updatedUser.profilePicture,
    about: updatedUser.about
  }

  return res.status(200).json(new ApiResponse(200, data, "Profile picture removed successfully"));

}

// search users -

export const searchUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search) {
      return next(new ApiError(400, 'Search term is required'));
    }

    const formattedSearch = search.replace(/\s+/g, '_');

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: formattedSearch,
        },
      },
      select: {
        id: true,
        username: true,
        about: true,
        email: true,
        profilePicture: true,
      },
    });

    if (users.length === 0) {
      return next(new ApiError(404, 'No users found'));
    }

    // Return the users in a success response
    return res.status(200).json(new ApiResponse(200, users, 'Users data fetched successfully'));

  } catch (error) {
    // Handle the error with ApiError
    return next(new ApiError(500, error.message || 'Failed to fetch users'));
  }
};

export const myProfile = async(req, res, next) =>{
    const id = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id },
    });
  
    if (!user) {
      return next(new ApiError(400, "User does not exist!"));
    }

    const data = {
      id: user.id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      about: user.about
    }
console.log("data in the my profile :- "+ JSON.stringify(data));
    return res.status(200).json(new ApiResponse(200, data,));

}