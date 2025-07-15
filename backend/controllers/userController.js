import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
// import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";

// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, phone, password, verificationMethod } = req.body; //user ke data ko liya hai

    if (!name || !email || !phone || !password || !verificationMethod) {
      return next(new ErrorHandler(" All fields are required.", 400)); //yha pe sari cheeze honi chahiye ye confirm kiya hai
    }
    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+91[6-9]\d{9}$/;
      return phoneRegex.test(phone); // phone number validate kiya hai
    }

    if (!validatePhoneNumber(phone)) {
      return next(new ErrorHandler("Invalid phone number.", 400)); // verification phone number ke liye add ki hai
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
        {
          phone,
          accountVerified: true,
        },
      ],
    }); // jo user already exist karta hai usse dekhne ka kaam karega

    if (existingUser) {
      return next(new ErrorHandler("Phone or Email is already used.", 400));
    } // ye dekhega ki phone number aur email unique hona chahiye

    const registerationAttemptByUser = await User.find({
      $or: [
        { phone, accountVerified: false },
        { email, accountVerified: false },
      ],
    }); // ye user ko dungne ki koshish karega

    if (registerationAttemptByUser.Length > 3) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number of attempts (3). Please try again after an hour.",
          400
        )
      );
    } // aagr user 3 se zayada time try karta hai toh ye error through hogi

    const userData = {
      name,
      email,
      phone,
      password,
    };
    const user = await User.create(userData); // yha pe user ka data store karvaya hai

    const verificationCode = await user.generateVerificationCode(); // yha pe user ko verification code bheja jayega
    user.verificationCode = verificationCode;
    await user.save();

    await sendVerificationCode(
      verificationMethod,
      verificationCode,
      name,
      email,
      phone,
      res
    ); // ye verification code bhejne ka method dekhega by email or phone

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  name,
  email,
  phone
) {
  try {
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);
      await sendEmail({ email, subject: "Your Verification Code", message });

      return {
        success: true,
        message: `Verification email sent successfully to ${name}`,
      };
    } else {
      return {
        success: false,
        message: "Invalid verification method.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to send verification code.",
    };
  }
}

function generateEmailTemplate(verificationCode) {
  return `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #4caf50; text-align: center;">Email Verification Code</h2>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">
        Thank you for signing up. Use the verification code below to verify your email address:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 28px; font-weight: bold; background: #f1f1f1; padding: 10px 20px; border-radius: 8px;">
          ${verificationCode}
          
        </span>
      </div>
      <p style="font-size: 14px; color: #555;">
        If you did not request this, please ignore this email.
      </p>
      <p style="font-size: 12px; text-align: center; color: #999;">
        &copy; 2025 Your Company Name. All rights reserved.
      </p>
    </div>
  `;
}

//otp verification
export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp, phone } = req.body;

  if (phone) {
    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+91[6-9]\d{9}$/;
      return phoneRegex.test(phone); // phone number validate kiya hai
    }
    if (!validatePhoneNumber(phone)) {
      return next(new ErrorHandler("Invalid phone number.", 400)); // verification phone number ke liye add ki hai
    }
  }

  try {
    const userAllEntries = await User.find({
      $or: [
        {
          email,
          accountVerified: false,
        },
        {
          phone,
          accountVerified: false,
        },
      ],
    }).sort({ created: -1 }); // user ki entries ko get kiya aur acending order me arrange kiya

    if (!userAllEntries) {
      return next(new ErrorHandler("User not found.", 400));
    } //aagr koi entry hi nahi mili toh uske liye msg

    let user;
    if (userAllEntries.Length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { phone, accountVerified: false },
          { email, accountVerified: false },
        ],
      });
    } else {
      user = userAllEntries[0];
    } // aagr user ki entry 1 se zayada hui toh vo delete kar dena hai

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP.", 400));
    } // aagr user ka verification code aur otp match nahi hota toh uske liye msg

    const currentTime = Date.now();
    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();

    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP Expire.", 400));
    } // current time me code enter kiya toh theek hai varna expire ka msg drop karna hai

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true }); // yha pe user save hojayega hamare database me

    sendToken(user, 200, "Account Verified", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error.", 500));
  }
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body; // user ko email or password ki request send ki yha pe

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  } // dono me se kuch bhi match nahi hua toh error bheja

  const user = await User.findOneAndUpdate({
    email,
    accountVerified: true,
  }).select("password"); // yha pe user ne dono cheeze provide ki hai toh vo further proceed karega

  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  } // dono me se kuch bhi invalid hua toh error send karna hai

  const isPasswordMatched = await user.comparePassword(password); // user mil gya toh password match karvana hai

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  } // password match nahi hone pe error bhejna hai

  sendToken(user, 200, "User logged in Successfully.", res);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .clearCookie("token", {
      expire: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out Successfully",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("User not found.", 400));
  }
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password is:- \n\n ${resetPasswordUrl} \n\n if you have not this email then please ignore it.`;

  try {
    sendEmail({
      email: user.email,
      subject: "MERN AUTHENTICATION APP RESET PASSWORD",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} Successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ verilidateBeforeSave: false });
    return next(
      new ErrorHandler(
        error.message ? error.message : "Cannot send reset password token.",
        500
      )
    );
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("Reset password token is invalid or been expired.", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password donot match.", 400)
    );
  }

  user.password = await req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Reset Password Successfully.", res);
});

// for admin page
export const getUserData = catchAsyncError(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    user,
  });
});