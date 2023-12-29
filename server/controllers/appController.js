import UserModel from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import ENV from '../config.js'

/** middleware for verify user */
export async function verifyUser(req, res, next){
  try {
      
      const { username } = req.method == "GET" ? req.query : req.body;

      // check the user existance
      let exist = await UserModel.findOne({ username });
      if(!exist) return res.status(404).send({ error : "Can't find User!"});
      next();

  } catch (error) {
      return res.status(404).send({ error: "Authentication Error"});
  }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;

    const existUsername = UserModel.findOne({ username });
    const existEmail = UserModel.findOne({ email });

    const [existingUsername, existingEmail] = await Promise.all([
      existUsername,
      existEmail
    ]);

    if (existingUsername) {
      return res.status(400).json({ error: "Please use a unique username" });
    }

    if (existingEmail) {
      return res.status(400).json({ error: "Please use a unique email" });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new UserModel({
        username,
        password: hashedPassword,
        profile: profile || "",
        email
      });

      await user.save();

      return res.status(201).json({ msg: "User registered successfully" });
    }
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await UserModel.findOne({ username });

    if (!user) {
      // User not found
      return res.status(404).send({ error: "Username not found" });
    }

    // Compare passwords
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      // Password doesn't match
      return res.status(400).send({ error: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      ENV.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send successful login response with token
    return res.status(200).send({
      msg: "Login successful",
      username: user.username,
      token,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error during login:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).send({ error: "Invalid Username" });
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Remove sensitive information like password from the user object
    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(200).send(userWithoutPassword);
  } catch (error) {
    console.error("Error during getUser:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).send({ error: "User Not Found or Unauthorized!" });
    }

    const body = req.body;

    // Use async/await with Mongoose's updateOne method
    const result = await UserModel.updateOne({ _id: userId }, body);

    if (result.n > 0) {
      return res.status(201).send({ msg: "Record Updated Successfully" });
    } else {
      return res.status(404).send({ error: "No records were modified" });
    }
  } catch (error) {
    console.error("Error during updateUser:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}



