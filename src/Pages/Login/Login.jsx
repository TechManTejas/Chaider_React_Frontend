import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { Image, Button } from 'react-bootstrap'
import toast, { Toaster } from 'react-hot-toast'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DataState } from "../../Context/Context"
import logger from "../../Log/logger"
import { urlAuth } from "../../backendURLs"

import TopNavigationBar from "../../Components/Navbars/NavbarLoginSignup"
import MobileDevice from "../../Components/MobileDevicesNote/MobileDevicesNote"

import "./Login.css"

const Login = () => {

    const { username, setUsername, detectMob } = DataState();

    const navigate = useNavigate();
    const [passwordShown, setPasswordShown] = useState(false);
    const togglePassword = () => {
        setPasswordShown(!passwordShown);
    };

    const [password, setPassword] = useState("");
    const [userlog, setUserlog] = useState(false);

    function Click(e) {
        e.preventDefault();
        logger.info("Authenticating User")
        const url = urlAuth;
        logger.info("URL to authenticate user: " + JSON.stringify(url));
        const data = { username: username, password: password };
        logger.info("User credentials: " + JSON.stringify(data));
        axios
            .post(url, data, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            })
            .catch(function (error) {
                logger.error("Error authenticating user: " + JSON.stringify(error));
                if (error.response) {
                    try {
                        if (error.response.data.detail === undefined) {
                            toast.error("Username or Password is incorrect");
                        }

                    } catch (error) {
                        toast.error("Server did not respond");
                    }

                    setUserlog(false);
                    return;
                }
            })
            .then(({ data }) => {
                logger.info("User logged in")
                logger.info("Access token for user: " + JSON.stringify(data.token))
                logger.info("Id for user: " + JSON.stringify(data.id))
                localStorage.setItem("AccessToken", data.token);
                localStorage.setItem("ChaiderUserId", data.id)
                setUserlog(true);
            });
    }

    useEffect(() => {
        logger.info("User is on Login page")
        const Token = localStorage.getItem("AccessToken");
        logger.info("Access token from localStorage:- " + Token);
        if (Token) {
            logger.info("Access token found, navigating to /Dashboard")
            navigate("/Dashboard")
        } else {
            logger.info("Access token not found, navigating to /")
            navigate("/")
        }
    }, [userlog]);

    return (
        <>
            {!detectMob() ?
                <>
                    <TopNavigationBar />
                    <Toaster />
                    <div className="backgr">
                        <div className="container-1">

                            <div className="d-flex justify-content-center" style={{ position: "relative", left: -25 }}>
                                <div style={{ "position": "relative", left: 15, top: 5 }}>
                                    <span>
                                        <Image src="logologin.png" width="60" />
                                    </span>
                                </div>
                                <h1>CHAIDER</h1>
                            </div>

                            <form method="post" onSubmit={Click}>
                                <div className="txt">
                                    <input
                                        type="text"
                                        required
                                        name="username"
                                        placeholder="Username"
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                        }}
                                        id="Name"
                                        value={username}
                                    />
                                    <span className="befre"></span>
                                </div>

                                <div className="txt d-flex">
                                    <input
                                        placeholder="Password"
                                        type={passwordShown ? "text" : "password"}
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                        name="password"
                                        id="password"
                                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                        title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                                        required
                                        autoComplete="on"
                                    />

                                    <span>
                                        <Button variant="light" color="white" onClick={togglePassword} style={{ borderRadius: "100%", color: "#28282B" }}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </Button>
                                    </span>
                                    <span className="befre"></span>
                                </div>

                                <div className="loginbut">
                                    <button
                                        type="submit"
                                    >
                                        Login
                                    </button>
                                </div>
                                <div className="signup_link">
                                    Don't have an account? <Link to="/Signup" style={{ color: "#3a7bd5" }}>Sign Up</Link>
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

export default Login;
