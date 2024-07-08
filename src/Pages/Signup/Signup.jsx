import React, { useState, useEffect } from "react";
import { Image } from 'react-bootstrap';
import { Link } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import logger from "../../Log/logger";
import { urlUsers } from "../../backendURLs"
import { DataState } from "../../Context/Context"

import TopNavigationBar from "../../Components/Navbars/NavbarLoginSignup";
import MobileDevice from "../../Components/MobileDevicesNote/MobileDevicesNote";

import "./Signup.css";

const Signup = () => {

    const { detectMob } = DataState();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        logger.info("User is on Signup page");
    })

    const checkValidation = (e) => {
        setConfirmPassword(e.target.value);
        if (password === e.target.value) {
            setError(" ");
        } else {
            setError("Passwords must be same!");
        }
    };

    function HandleClick(e) {
        e.preventDefault();
        if (password === confirmPassword) {
            const url = urlUsers;
            logger.info("URL to signup user: " + JSON.stringify(url));
            const data = { username: username, email: email, password: password };
            logger.info("User credentials: " + JSON.stringify(data));
            axios
                .post(url, data, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                })
                .then(({ data }) => {
                    setUsername("");
                    setPassword("");
                    setEmail("");
                    setConfirmPassword("");
                    toast.success("Signed Up Successfully! Go Back to Login Page");
                    logger.info("Signed Up Successfully")
                });
        } else {
            toast.error("Passwords must be same!");
        }
    }

    return (
        <>
            {!detectMob() ?
                <>
                    <TopNavigationBar />
                    <Toaster />
                    <div className="bg">
                        <div className="center">

                            <div className="d-flex justify-content-center" style={{ position: "relative", left: -25 }}>
                                <div style={{ "position": "relative", left: 15, top: 5 }}>
                                    <span>
                                        <Image src="logologin.png" width="60" />
                                    </span>
                                </div>
                                <h1>CHAIDER</h1>
                            </div>


                            <form method="post" onSubmit={HandleClick}>
                                <div className="txt_field">
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        name="username"
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                        }}
                                        required
                                    />
                                    <span className="eye">
                                        <i className="fa fa-lg fa-user"></i>
                                    </span>

                                </div>

                                <div className="txt_field">
                                    <input
                                        type="email"
                                        placeholder="E-mail"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                        }}
                                        name="email"
                                        pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
                                        title="Must be in a valid format"
                                        required
                                    />
                                    <span className="eye">
                                        <i className="fa fa-sm  fa-envelope-open"></i>
                                    </span>
                                </div>

                                <div className="txt_field">
                                    <input
                                        type="password"
                                        value={password}
                                        name="password"
                                        id="pass1"
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                        title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                                        required
                                        autoComplete="on"
                                    />
                                    <span className="eye">
                                        <i className="fa fa-lg fa-lock"></i>
                                    </span>
                                </div>
                                <div className="txt_field">
                                    <input
                                        type="password"
                                        id="pass2"
                                        value={confirmPassword}
                                        onChange={(e) => checkValidation(e)}
                                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                        placeholder="Confirm Password"
                                        name="confirmPass"
                                        required
                                        autoComplete="on"
                                    />
                                </div>
                                <div
                                    style={{
                                        color: "red",
                                        height: 5,
                                        textAlign: "center",
                                        fontSize: "small",
                                        marginTop: "0px",
                                        paddingBottom: "5px",
                                    }}
                                >
                                    {error}
                                </div>
                                <button type="submit">Create Account</button>

                                <div className="cpr">
                                    <div className="signup_link">
                                        Already have an account? <Link to="/" style={{ color: '#3a7bd5' }}>Sign in</Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
                :
                <MobileDevice />
            }
        </>
    );
};

export default Signup;
