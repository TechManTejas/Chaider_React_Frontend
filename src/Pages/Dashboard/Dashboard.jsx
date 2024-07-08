import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProSidebar, Menu, MenuItem, SidebarHeader, SidebarContent } from 'react-pro-sidebar';
import { faSitemap, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Card, Button, Modal, Form } from 'react-bootstrap';
import { DataState } from "../../Context/Context"
import TopNavigationBar from "./NavbarDashboard";
import MobileDevice from "../../Components/MobileDevicesNote/MobileDevicesNote";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import ReactTooltip from 'react-tooltip';
import './Dashboard.css';
import 'react-pro-sidebar/dist/css/styles.css';
import { urlUsers, urlVisualisation, urlChaiderCSV } from '../../backendURLs'
import { runTests } from "../../tests/tests";

import logger from "../../Log/logger"
logger.fileFormat = "SIMPLE";

export var CSVFile;
export var mappingData;
var url;
var chaiderUserId;
var userProjectsData = [];

function Dashboard() {
  const [loaded, isLoaded] = useState(false);
  const [userlog, setUserlog] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const navigate = useNavigate();
  const { id, setId, projectName, setProjectName, projectDescription, setProjectDescription, setModalVariables, username, setUsername, detectMob } = DataState();
  const [file, setFile] = useState("");
  const [allProjectsData, setAllProjectsData] = useState([])

  const getUserData = (id) => {

    url = urlUsers + `${id}/`
    logger.info("url to get user information" + JSON.stringify(url))

    axios.get(url, {
      headers: { 'Authorization': `Token ${localStorage.getItem("AccessToken")}` }
    }).then(({ data }) => {
      setUsername(data.username);
      logger.info("Username recieved: " + JSON.stringify(data.username))
    });

    url = urlVisualisation
    logger.info("url to get projects data" + JSON.stringify(url))
    axios.get(url, {
      headers: { 'Authorization': `Token ${localStorage.getItem("AccessToken")}` }
    }).then(({ data }) => {
      userProjectsData = data;
      logger.info("All Projects Data:- " + JSON.stringify(userProjectsData));
      setAllProjectsData(userProjectsData);
      isLoaded(true);
    });
  }

  const setProjectId = (projectId) => {
    setId(projectId);
    logger.info("Project Id:- " + JSON.stringify(projectId))
    localStorage.setItem("CurrentProjectId", projectId);
    logger.info("Navigating to /Visualisation Page")
    navigate("/Visualisation")
  }

  useEffect(() => {

    // runTests()

    logger.info("User is on Dashboard page")
    setModalVariables([])
    const Token = localStorage.getItem("AccessToken");
    logger.info("Access token from localStorage: " + Token);
    if (!Token) {
      logger.info("Token not found, navigating to /")
      navigate("/")
    } else {
      logger.info("Token found")
      chaiderUserId = localStorage.getItem("ChaiderUserId")
      logger.info("Chaider User Id:- " + JSON.stringify(chaiderUserId))
      getUserData(chaiderUserId)
    }
  }, [userlog])

  const [showDeleteProject, setShowDeleteProject] = useState(false);

  const handleCloseDeleteProject = () => {
    url = urlVisualisation + `${id}/`
    logger.info("url to get delete project" + JSON.stringify(url))
    axios.delete(url, {
      headers: { 'Authorization': `Token ${localStorage.getItem("AccessToken")}` }
    }).then(({ data }) => {
      getUserData(chaiderUserId);
    });
    logger.info("Project Deleted Successfully")
    setShowDeleteProject(false)
  };

  const handleShowDeleteProject = (id) => {
    setId(id)
    setShowDeleteProject(true)
  };

  const [showCreateProject, setShowCreateProject] = useState(false);
  const handleCloseCreateProject = () => setShowCreateProject(false);
  const handleShowCreateProject = () => {
    setProjectName("");
    setProjectDescription("");
    setFile("")
    setShowCreateProject(true);
  }

  const onFileChange = (e) => {
    setFile(e.target.value);
    CSVFile = e.target.files[0]
  }

  const notifyAsyncStatus = (e) => {
    logger.info("Creating Project...")
    toast.promise(
      SubmitEvent(e),
      {
        loading: 'Creating Project...',
        success: <b>Created Successfully!</b>,
        error: <b>An Error Occurred!</b>,
      }
    );
  };

  const SubmitEvent = async (e) => {
    setShowCreateProject(false);
    e.preventDefault();
    const url = urlChaiderCSV;
    logger.info("url to create project:- " + JSON.stringify(url))

    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("description", projectDescription);
    formData.append("file", CSVFile);
    formData.append("userid", chaiderUserId);
    logger.info("FormData about to post:- " + JSON.stringify(formData))

    const response = axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Token ${localStorage.getItem("AccessToken")}`
      }
    }).then(({ data }) => {

      logger.info("Data after uploading file: " + JSON.stringify(data))

      mappingData = []
      localStorage.setItem("CurrentProjectId", data.id)
      logger.info("Project Id is set to:- " + JSON.stringify(data.id))
      if (data.hasOwnProperty('filename') && data.hasOwnProperty('variables')) {

        for (let v in data.variables) {
          mappingData.push({ "variablename": v, "variablecardinality": data.variables[v] });
        }

        logger.info("Project Created Successfully")
        setModalVariables(mappingData);
        logger.info("Names in column in dataset with cardinality:- " + JSON.stringify(mappingData))
        logger.info("Navigating to /Visualisation")
        navigate("/Visualisation")
      }
    });

    return response
  };

  function ErrorFallback({ error }) {
    logger.error(error)
    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre style={{ color: 'red' }}>{error.message}</pre>
      </div>
    )
  }

  try {
    return (
      <>
        {!detectMob() ?
          <>
            <>
              <ReactTooltip id="tip_createproject" place="left" effect="solid" delayShow={1000}>
                Create New Project
              </ReactTooltip>
            </>
            <>
              <TopNavigationBar />
              <Toaster
                position="top-center"
                reverseOrder={false}
              />
              <div className="d-flex"
                style={{ background: "linear-gradient(to right, #3a7bd5, #00d2ff)", }}
              >
                <div onMouseEnter={() => {
                  setToggleSidebar(false);
                }}

                  onMouseLeave={() => {
                    setToggleSidebar(true);
                  }}

                >
                  <ProSidebar collapsed={toggleSidebar} >
                    <SidebarHeader style={{ background: "#7E7E7E" }}>
                      <dic className="d-flex justify-content-center">
                        <div className="m-2" style={{ fontSize: 16, fontFamily: "Roboto", color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {username}
                        </div>
                      </dic>

                    </SidebarHeader>
                    <SidebarContent>
                      <Menu>
                        <MenuItem icon={<FontAwesomeIcon icon={faSitemap} />}>My Projects</MenuItem>
                        {/* <MenuItem icon={<FontAwesomeIcon icon={faCircleInfo} />}>About Us</MenuItem> */}
                      </Menu>
                    </SidebarContent>

                  </ProSidebar>
                </div>

                <div className="d-flex flex-column"
                  style={{
                    height: "95vh", width: "100%", overflow: "auto"
                  }}>

                  <div className="d-flex justify-content-end">
                    <div style={{ margin: '2rem', position: "absolute", zIndex: "1" }}>
                      <Button data-tip data-for="tip_createproject" onClick={handleShowCreateProject} style={{ borderRadius: "50%", width: "4rem", height: "4rem", boxShadow: "3px 3px 15px rgb(0, 0, 0)" }}>{<FontAwesomeIcon icon={faPlus} size="xl"></FontAwesomeIcon>}</Button>
                    </div>
                  </div>

                  <div>

                    <div>
                      <div style={{ margin: '2rem' }}><h1 style={{ color: 'white', fontWeight: 'bold' }}>All Projects</h1></div>
                      <hr></hr>

                      <div className="d-flex flex-wrap">
                        {
                          (isLoaded) && allProjectsData.map((data) => {
                            return (
                              <div key={data.id}>
                                <div style={{ margin: '2rem' }}>
                                  <Card style={{ backgroundColor: 'rgba(255,255,255,0.75)', width: '30rem', boxShadow: "rgba(0, 0, 0, 0.6) 0px 25px 20px -20px" }} >
                                    <Card.Img variant="top" src={data.preview} />
                                    <Card.Body>
                                      <Card.Title>{data.name}</Card.Title>
                                      <Card.Text>
                                        {data.description}
                                      </Card.Text>
                                      <div className="d-flex justify-content-between">
                                        <Button onClick={() => { setProjectId(data.id) }}>Open</Button>
                                        <button className="deleteProjectBtn" variant="light" onClick={() => { handleShowDeleteProject(data.id) }}><FontAwesomeIcon icon={faXmark} /></button>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* modal delete project */}
              <>
                <Modal show={showDeleteProject} onHide={() => { setShowDeleteProject(false) }}>
                  <Modal.Header closeButton>
                    <Modal.Title>Delete Project</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure you want to delete this project?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="danger" onClick={handleCloseDeleteProject}>
                      DELETE
                    </Button>
                  </Modal.Footer>
                </Modal>
              </>
              {/* modal create project */}
              <>
                <Modal
                  show={showCreateProject}
                  onHide={handleCloseCreateProject}

                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Create New Project
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <>
                      <Form>
                        <Form.Group className="mb-3" controlId="formProjectName">
                          <Form.Label>Project Name</Form.Label>
                          <Form.Control required type={"text"} placeholder="Enter a name for the project" onChange={(e) =>
                            setProjectName(e.target.value)} value={projectName} name="name" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formFile">
                          <Form.Label>CSV File</Form.Label>
                          <Form.Control required type={"file"} onChange={(e) => { onFileChange(e) }} value={file} name="file" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                          <Form.Label>Project Description (Optional)</Form.Label>
                          <Form.Control as="textarea" rows={10} placeholder="Describe the project" onChange={(e) =>
                            setProjectDescription(e.target.value)} value={projectDescription} name="description" />
                        </Form.Group>

                        <div className="d-flex">
                          <Button style={{ width: "100%" }} variant="success" type="submit" onClick={(e) => {

                            if (projectName != "" && file != "") {
                              notifyAsyncStatus(e)
                            }


                          }}>CREATE</Button>
                        </div>

                      </Form>
                    </>
                  </Modal.Body>
                </Modal>
              </>
            </>
          </>
          :
          <MobileDevice />
        }
      </>

    )
  } catch (error) {
    return <ErrorFallback error={error} />
  }
}

export default Dashboard;
