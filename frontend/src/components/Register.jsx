import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRegister = async (data) => {
    data.phone = `+91${data.phone}`;
    await axios
      .post("https://ybm-school-site.onrender.com/api/v1/register", data, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        toast.success(res.data.message);
        navigateTo(`/otp-verification/${data.email}/${data.phone}`);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className="register-form-container">
      <form onSubmit={handleSubmit((data) => handleRegister(data))}>
        <h2>Register / Contact</h2>
        <input
          type="text"
          placeholder="Name"
          className="input-field"
          required
          {...register("name")}
        />
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          required
          {...register("email")}
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          required
          {...register("password")}
        />
        <div>
          <span>+91</span>
          <input
            type="number"
            placeholder="Phone"
            className="phone-input"
            required
            {...register("phone")}
          />
        </div>
        <div className="verification-method">
          <p>Select Verification Method</p>
          <div className="wrapper">
            <label>
              <input
                type="radio"
                name="verificationMethod"
                value={"email"}
                {...register("verificationMethod")}
                required
              />
              Email
            </label>
          </div>
        </div>

        <label className="checkbox-label">
          <input type="checkbox" name="agreedToTerms" />
          <span>I have read all the terms & privacy policy.</span>
        </label>

        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>

      <p style={{ marginTop: "5px" }}>
        Already have an account?{" "}
        <span
          onClick={() => navigateTo("/login")}
          style={{
            color: "#e77a00",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Register;
