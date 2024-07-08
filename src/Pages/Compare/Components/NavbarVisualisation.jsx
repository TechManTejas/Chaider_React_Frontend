import { Navbar, Modal, Button, Container, Offcanvas, Dropdown, Form, Nav, Image, DropdownButton, ButtonGroup } from 'react-bootstrap';
import React, { useState } from "react";
import { DataState } from "../../../Context/Context"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faGear, faFloppyDisk, faDownload, faDoorOpen, faPenClip, faEraser, faHand } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";
import { getStageInfoAndSave } from "../Visualisation"
import toast, { Toaster } from 'react-hot-toast';
import logger from "../../../Log/logger"
import axios from "axios"
import {urlVisualisation} from "../../../backendURLs"

function TopNavigationBar() {

    const navigate = useNavigate();
    const { handleExport, setHandTool, setTool, tool, xVarNodes, lines, instance, setInstance, instanceNames, setReloader, reloader } = DataState();
    
    const [showBackToDashboard, setShowBackToDashboard] = useState(false);
    const handleCloseBackToDashboard = () => setShowBackToDashboard(false); 
    const handleShowBackToDashboard = () => setShowBackToDashboard(true);

    const [showCreateNewInstance, setShowCreateNewInstance] = useState(false);
    const handleCloseCreateNewInstance = () => setShowCreateNewInstance(false);
    const handleShowCreateNewInstance = () => setShowCreateNewInstance(true);

    const [newInstanceName, setNewInstanceName] = useState("");

    const quitVisualisation = () => {
        logger.info("Quitting Visualization")
        logger.info("Navigating to /Dashboard")
        navigate("/Dashboard");
        setShowBackToDashboard(false);
    }

    const saveData = () => {
        logger.info("Saving data...")
        getStageInfoAndSave(xVarNodes, lines);
    }

    const notifyAsyncStatus = (e) => {
        logger.info("Creating Instance...")
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
        var _id = localStorage.getItem("CurrentProjectId")
        const url = urlVisualisation + `${_id}/`;
        axios.get(url, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("AccessToken")}`
            }
        }).then(async ({ data }) => {
            var allStageData = data.stageData
            var allInstance = data.instances.names
            logger.info(JSON.stringify(allInstance))
            allStageData[newInstanceName] = {}
            allInstance.push(newInstanceName)

            let datanew = new FormData();
            datanew.append('stageData', JSON.stringify(allStageData));
            datanew.append('instances', JSON.stringify({ "names": allInstance}))
            const res = await axios.patch(url, datanew, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Token ${localStorage.getItem("AccessToken")}`
                }
            })
            localStorage.setItem("instance", newInstanceName) 
            setInstance(newInstanceName)
            handleCloseCreateNewInstance()
            return res;
        });
    };

    return (
        <>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top">
                <Container>

                    <Nav className="me-2">
                        <>
                            <div className="me-1">
                                <ProfileOffCanvas name={<FontAwesomeIcon icon={faCircleInfo} />} placement={"start"} />
                            </div>
                        </>
                    </Nav>

                    <div className="me-1">
                        <span>
                            <Image src="logo761.png" width="40" />
                        </span>
                    </div>

                    <Navbar.Brand href="/visualisation">CHAIDER VISUALISATION</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">

                    <Navbar.Brand className='text-success'>{instance}</Navbar.Brand>

                        <>
                            <div className="me-auto">
                            </div>
                            <Button onClick={handleShowCreateNewInstance}>Create new instance +</Button>

                        </>

                        <>
                            <div className="me-auto">
                            </div>
                            <div className="me-1">
                                <Button variant="primary" onClick={(e) => { setHandTool("grab") }}>
                                    <FontAwesomeIcon icon={faHand} />
                                </Button>
                            </div>
                        </>

                        <>
                            <div className="me-auto">
                            </div>
                            <div className="me-1">
                                <Button variant="primary" onClick={(e) => { setHandTool("crosshair"); setTool("pen"); console.log(tool) }}>
                                    <FontAwesomeIcon icon={faPenClip} />
                                </Button>
                            </div>
                            <div className="me-1">
                                <Button variant="primary" onClick={(e) => { setHandTool("crosshair"); setTool("eraser"); console.log(tool) }}>
                                    <FontAwesomeIcon icon={faEraser} />
                                </Button>
                            </div>
                        </>

                        <>
                            <div className="me-auto">
                            </div>
                            <div className="me-1">
                                <Button variant="success" onClick={saveData}>
                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                </Button>
                            </div>
                            <div className="me-1">
                                <Button variant="primary" onClick={(e) => { handleExport() }}>
                                    <FontAwesomeIcon icon={faDownload} />
                                </Button>
                            </div>
                            <div className="me-1">
                                <SettingsOffCanvas name={<FontAwesomeIcon icon={faGear} />} placement={"end"} />
                            </div>

                            <div className="me-1">
                                <Button variant="dark " onClick={handleShowBackToDashboard}>
                                    <FontAwesomeIcon icon={faDoorOpen} />
                                </Button>
                            </div>
                        </>

                    </Navbar.Collapse>

                </Container>
            </Navbar>

            <Toaster
                position="top-center"
                reverseOrder={false}
            />

            <>
                <Modal show={showBackToDashboard} onHide={handleCloseBackToDashboard}>
                    <Modal.Header closeButton>
                        <Modal.Title>Back to Dashboard</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Do you want to quit and go back to Dashboard?</Modal.Body>
                    <Modal.Footer>
                        <Button onClick={quitVisualisation}>
                            Quit
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>

            <>
                <Modal show={showCreateNewInstance} onHide={handleCloseCreateNewInstance}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create New Instance</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <>
                            <Form>
                                <Form.Group className="mb-3" controlId="formProjectName">
                                    <Form.Label>Instance Name</Form.Label>
                                    <Form.Control required type={"text"} placeholder="Enter a name for the instance" name="instancename" value={newInstanceName} onChange={(e) =>{setNewInstanceName(e.target.value)}}/>
                                </Form.Group>

                                <div className="d-flex">
                                    <Button style={{ width: "100%" }} variant="success" onClick={(e) =>{
                                        if (newInstanceName != "") {
                                            if(!instanceNames.includes(newInstanceName)){
                                                notifyAsyncStatus(e)
                                                setReloader(!reloader)
                                            }else{
                                                toast.error("Instance name already exists!")
                                            }
                                        }
                                    }}>CREATE</Button>
                                </div>
                            </Form>
                        </>
                    
                    </Modal.Body>
                </Modal>
            </>
        </>
    );
}

function SettingsOffCanvas({ name, ...props }) {

    const { settingNodeColor, setSettingNodeColor, settingNodePopulationPerColor, setSettingNodePopulationPerColor, settingNodeXVariableColor, setSettingNodeXVariableColor,
        settingNodeTitleFontSize, setSettingNodeTitleFontSize, settingNodeTitleFontColor, setSettingNodeTitleFontColor,
        settingNodePopulationPerFontSize, setSettingNodePopulationPerFontSize, settingNodePopulationPerFontColor, setSettingNodePopulationPerFontColor,
        settingNodeXVariableFontSize, setSettingNodeXVariableFontSize, settingNodeXVariableFontColor, setSettingNodeXVariableFontColor,
        settingNodeContentFontSize, setSettingNodeContentFontSize, settingNodeContentFontColor, setSettingNodeContentFontColor,
        settingPrecisionContent, setsettingPrecisionContent, settingPrecisionPopulation, setsettingPrecisionPopulation,
        settingTreeLineThickness, setSettingTreeLineThickness, settingTreeLineColor, setSettingTreeLineColor, settingZoomIntensity, setSettingZoomIntensity, settingNodeColorOpacity, setSettingNodeColorOpacity, settingNodePopulationPerColorOpacity, setSettingNodePopulationPerColorOpacity,
        settingNodeXVariableColorOpacity, setSettingNodeXVariableColorOpacity, settingNodeTitleFontColorOpacity, setSettingNodeTitleFontColorOpacity,
        settingNodePopulationPerFontColorOpacity, setSettingNodePopulationPerFontColorOpacity, settingNodeXVariableFontColorOpacity, setSettingNodeXVariableFontColorOpacity,
        settingNodeContentFontColorOpacity, setSettingNodeContentFontColorOpacity, settingTreeLineColorOpacity, setSettingTreeLineColorOpacity,
        settingAssistantContainerDisplay, setSettingAssistantContainerDisplay,
        settingPCLassDisplay, setSettingPCLassDisplay,
        settingZScoreDisplay, setSettingZScoreDisplay,
        settingChiSquareDisplay, setSettingChiSquareDisplay,
        settingRSquareDisplay, setSettingRSquareDisplay,
        settingAdjustedRSquareDisplay, setSettingAdjustedRSquareDisplay,
        settingGiniDisplay, setSettingGiniDisplay,
    } = DataState();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="danger" onClick={handleShow} className="me-2">
                {name}
            </Button>
            <Offcanvas show={show} onHide={handleClose} {...props}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>SETTINGS</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <>
                        <div className="h2 text-primary">
                            HUD Elements
                        </div>
                        <>
                            <Dropdown.Divider />
                            <div className="d-flex">
                                <div className="h5 text-danger">
                                    Assistant Pie Chart
                                </div>
                                <div style={{ paddingLeft: '10px', paddingTop: '2px' }}>
                                    <Form.Check
                                        checked={settingAssistantContainerDisplay}
                                        onChange={(e) => { setSettingAssistantContainerDisplay(!settingAssistantContainerDisplay) }}
                                        type="switch"
                                        id="custom-switch"
                                    />
                                </div>

                            </div>
                        </>
                    </>
                    <>
                        <div className="h2 text-primary">
                            STATISTICAL VALUES
                        </div>
                        <>
                            <Dropdown.Divider />
                            <div className="d-flex">
                                <div className="h5 text-danger">
                                    pValue
                                </div>
                                <div style={{ paddingLeft: '10px', paddingTop: '2px' }}>
                                    <Form.Check
                                        checked={settingPCLassDisplay}
                                        onChange={(e) => { setSettingPCLassDisplay(!settingPCLassDisplay) }}
                                        type="switch"
                                        id="custom-switch"
                                    />
                                </div>
                            </div>

                            <div className="d-flex">
                                <div className="h5 text-danger">
                                    zScore
                                </div>
                                <div style={{ paddingLeft: '10px', paddingTop: '2px' }}>
                                    <Form.Check
                                        checked={settingZScoreDisplay}
                                        onChange={(e) => { setSettingZScoreDisplay(!settingZScoreDisplay) }}
                                        type="switch"
                                        id="custom-switch"
                                    />
                                </div>

                            </div>

                            <div className="d-flex">
                                <div className="h5 text-danger">
                                    Chi-Square
                                </div>
                                <div style={{ paddingLeft: '10px', paddingTop: '2px' }}>
                                    <Form.Check
                                        checked={settingChiSquareDisplay}
                                        onChange={(e) => { setSettingChiSquareDisplay(!settingChiSquareDisplay) }}
                                        type="switch"
                                        id="custom-switch"
                                    />
                                </div>

                            </div>

                            <div className="d-flex">
                                <div className="h5 text-danger">
                                    R-Square
                                </div>
                                <div style={{ paddingLeft: '10px', paddingTop: '2px' }}>
                                    <Form.Check
                                        checked={settingRSquareDisplay}
                                        onChange={(e) => { setSettingRSquareDisplay(!settingRSquareDisplay) }}
                                        type="switch"
                                        id="custom-switch"
                                    />
                                </div>

                            </div>

                            <div className="d-flex">
                                <div className="h5 text-danger">
                                    Adjusted R-Square
                                </div>
                                <div style={{ paddingLeft: '10px', paddingTop: '2px' }}>
                                    <Form.Check
                                        checked={settingAdjustedRSquareDisplay}
                                        onChange={(e) => { setSettingAdjustedRSquareDisplay(!settingAdjustedRSquareDisplay) }}
                                        type="switch"
                                        id="custom-switch"
                                    />
                                </div>

                            </div>

                            <div className="d-flex">
                                <div className="h5 text-danger">
                                    Gini
                                </div>
                                <div style={{ paddingLeft: '10px', paddingTop: '2px' }}>
                                    <Form.Check
                                        checked={settingGiniDisplay}
                                        onChange={(e) => { setSettingGiniDisplay(!settingGiniDisplay) }}
                                        type="switch"
                                        id="custom-switch"
                                    />
                                </div>

                            </div>
                        </>
                    </>
                    <>
                        <div className="h2 text-primary">
                            NODE APPEARANCE
                        </div>
                        <>
                            <Dropdown.Divider />
                            <>
                                <div className="h5 text-danger">
                                    Colors
                                </div>
                                <div className="d-flex justify-content-between">

                                    <div className="d-flex flex-column justify-content-between">

                                        <div className="d-flex justify-content-center">
                                            <Form.Label htmlFor="nodeColorPicker">
                                                <div className="h6">
                                                    Node
                                                </div>
                                            </Form.Label>
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <Form.Control
                                                type="color"
                                                id="nodeColorPicker"
                                                defaultValue={settingNodeColor}
                                                onChange={(e) => setSettingNodeColor(e.target.value)}
                                                title="Choose your color"
                                            />
                                        </div>

                                        <div>
                                            <Form.Label>
                                                <div className="h6">
                                                    Opacity:
                                                </div>
                                                <div className="h5">
                                                    {settingNodeColorOpacity}
                                                </div>
                                            </Form.Label>
                                            <Form.Range defaultValue={settingNodeColorOpacity} onChange={(e) => { setSettingNodeColorOpacity(e.target.value) }} />
                                        </div>

                                    </div>

                                    <div className="d-flex flex-column justify-content-between">

                                        <div className="d-flex justify-content-center">
                                            <Form.Label htmlFor="nodePopulationColorPicker">
                                                <div className="h6">
                                                    Population %
                                                </div>
                                            </Form.Label>
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <Form.Control
                                                type="color"
                                                id="nodePopulationColorPicker"
                                                defaultValue={settingNodePopulationPerColor}
                                                onChange={(e) => setSettingNodePopulationPerColor(e.target.value)}
                                                title="Choose your color"
                                            />
                                        </div>

                                        <div>
                                            <Form.Label>
                                                <div className="h6">
                                                    Opacity:
                                                </div>
                                                <div className="h5">
                                                    {settingNodePopulationPerColorOpacity}
                                                </div>
                                            </Form.Label>
                                            <Form.Range defaultValue={settingNodePopulationPerColorOpacity} onChange={(e) => { setSettingNodePopulationPerColorOpacity(e.target.value) }} />
                                        </div>

                                    </div>

                                    <div className="d-flex flex-column justify-content-between">

                                        <div className="d-flex justify-content-center">
                                            <Form.Label htmlFor="nodeXVariableColorPicker">
                                                <div className="h6">
                                                    X Variable
                                                </div>
                                            </Form.Label>
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <Form.Control
                                                type="color"
                                                id="nodeXVariableColorPicker"
                                                defaultValue={settingNodeXVariableColor}
                                                onChange={(e) => setSettingNodeXVariableColor(e.target.value)}
                                                title="Choose your color"
                                            />
                                        </div>

                                        <div>
                                            <Form.Label>
                                                <div className="h6">
                                                    Opacity:
                                                </div>
                                                <div className="h5">
                                                    {settingNodeXVariableColorOpacity}
                                                </div>
                                            </Form.Label>
                                            <Form.Range defaultValue={settingNodeXVariableColorOpacity} onChange={(e) => { setSettingNodeXVariableColorOpacity(e.target.value) }} />
                                        </div>

                                    </div>
                                </div>

                            </>
                            <Dropdown.Divider />
                            <>
                                <div className="h5 text-danger">
                                    Fonts
                                </div>
                                <div>

                                    <div className="d-flex justify-content-around">
                                        <div>
                                            <Form.Label htmlFor="nodeTitleFontSize">
                                                <div className="h6">Title</div>
                                            </Form.Label>
                                            <Form.Control
                                                defaultValue={settingNodeTitleFontSize}
                                                onChange={(e) => setSettingNodeTitleFontSize(e.target.value)}
                                                type="number"
                                                id="nodeTitleFontSize"
                                            />
                                        </div>
                                        <div className="d-flex flex-column justify-content-between">
                                            <>
                                                <Form.Label htmlFor="nodeTitleFontColorPicker">
                                                    <div className="h6">
                                                        Color
                                                    </div>
                                                </Form.Label>
                                            </>
                                            <div className="d-flex justify-content-center">
                                                <Form.Control
                                                    type="color"
                                                    id="nodeTitleFontColorPicker"
                                                    defaultValue={settingNodeTitleFontColor}
                                                    onChange={(e) => setSettingNodeTitleFontColor(e.target.value)}
                                                    title="Choose your color"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="container">
                                        <Form.Label>
                                            <div className="h6">
                                                Opacity:
                                            </div>
                                            <div className="h5">
                                                {settingNodeTitleFontColorOpacity}
                                            </div>
                                        </Form.Label>
                                        <Form.Range defaultValue={settingNodeTitleFontColorOpacity} onChange={(e) => { setSettingNodeTitleFontColorOpacity(e.target.value) }} />
                                    </div>

                                    <div className="d-flex justify-content-around">
                                        <div>
                                            <Form.Label htmlFor="nodePopulationFontSize">
                                                <div className="h6">Population %</div>
                                            </Form.Label>
                                            <Form.Control
                                                defaultValue={settingNodePopulationPerFontSize}
                                                onChange={(e) => setSettingNodePopulationPerFontSize(e.target.value)}
                                                type="number"
                                                id="nodePopulationFontSize"
                                            />
                                        </div>

                                        <div className="d-flex flex-column justify-content-between">
                                            <>
                                                <Form.Label htmlFor="nodePopulationFontColorPicker">
                                                    <div className="h6">
                                                        Color
                                                    </div>
                                                </Form.Label>
                                            </>
                                            <div className="d-flex justify-content-center">
                                                <Form.Control
                                                    type="color"
                                                    id="nodePopulationFontColorPicker"
                                                    defaultValue={settingNodePopulationPerFontColor}
                                                    onChange={(e) => setSettingNodePopulationPerFontColor(e.target.value)}
                                                    title="Choose your color"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="container">
                                        <Form.Label>
                                            <div className="h6">
                                                Opacity:
                                            </div>
                                            <div className="h5">
                                                {settingNodePopulationPerFontColorOpacity}
                                            </div>
                                        </Form.Label>
                                        <Form.Range defaultValue={settingNodePopulationPerFontColorOpacity} onChange={(e) => { setSettingNodePopulationPerFontColorOpacity(e.target.value) }} />
                                    </div>

                                    <div className="d-flex justify-content-around">
                                        <div>
                                            <Form.Label htmlFor="nodeXVariableFontSize">
                                                <div className="h6">X Variable</div>
                                            </Form.Label>
                                            <Form.Control
                                                defaultValue={settingNodeXVariableFontSize}
                                                onChange={(e) => setSettingNodeXVariableFontSize(e.target.value)}
                                                type="number"
                                                id="nodeXVariableFontSize"
                                            />
                                        </div>

                                        <div className="d-flex flex-column justify-content-between">
                                            <>
                                                <Form.Label htmlFor="nodeXVariableFontColorPicker">
                                                    <div className="h6">
                                                        Color
                                                    </div>
                                                </Form.Label>
                                            </>
                                            <div className="d-flex justify-content-center">
                                                <Form.Control
                                                    type="color"
                                                    id="nodeXVariableFontColorPicker"
                                                    defaultValue={settingNodeXVariableFontColor}
                                                    onChange={(e) => setSettingNodeXVariableFontColor(e.target.value)}
                                                    title="Choose your color"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="container">
                                        <Form.Label>
                                            <div className="h6">
                                                Opacity:
                                            </div>
                                            <div className="h5">
                                                {settingNodeXVariableFontColorOpacity}
                                            </div>
                                        </Form.Label>
                                        <Form.Range defaultValue={settingNodeXVariableFontColorOpacity} onChange={(e) => { setSettingNodeXVariableFontColorOpacity(e.target.value) }} />
                                    </div>

                                    <div className="d-flex justify-content-around">
                                        <div>
                                            <Form.Label htmlFor="nodeContentFontSize">
                                                <div className="h6">Content</div>
                                            </Form.Label>
                                            <Form.Control
                                                defaultValue={settingNodeContentFontSize}
                                                onChange={(e) => setSettingNodeContentFontSize(e.target.value)}
                                                type="number"
                                                id="nodeContentFontSize"
                                            />
                                        </div>

                                        <div className="d-flex flex-column justify-content-between">
                                            <>
                                                <Form.Label htmlFor="nodeContentFontColorPicker">
                                                    <div className="h6">
                                                        Color
                                                    </div>
                                                </Form.Label>
                                            </>
                                            <div className="d-flex justify-content-center">
                                                <Form.Control
                                                    type="color"
                                                    id="nodeContentFontColorPicker"
                                                    defaultValue={settingNodeContentFontColor}
                                                    onChange={(e) => setSettingNodeContentFontColor(e.target.value)}
                                                    title="Choose your color"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="container">
                                        <Form.Label>
                                            <div className="h6">
                                                Opacity:
                                            </div>
                                            <div className="h5">
                                                {settingNodeContentFontColorOpacity}
                                            </div>
                                        </Form.Label>
                                        <Form.Range defaultValue={settingNodeContentFontColorOpacity} onChange={(e) => { setSettingNodeContentFontColorOpacity(e.target.value) }} />
                                    </div>

                                </div>
                            </>
                            <Dropdown.Divider />
                            <>
                                <div className="h5 text-danger">
                                    Precision in Values
                                </div>
                                <>
                                    <Form.Label htmlFor="nodeContentPrecision">
                                        <div className="h6">Content</div>
                                    </Form.Label>
                                    <Form.Control
                                        defaultValue={settingPrecisionContent}
                                        onChange={(e) => setsettingPrecisionContent(e.target.value)}
                                        type="number"
                                        id="nodeContentPrecision"
                                    />
                                </>
                                <>
                                    <Form.Label htmlFor="nodePopulationPrecision">
                                        <div className="h6">Population %</div>
                                    </Form.Label>
                                    <Form.Control
                                        defaultValue={settingPrecisionPopulation}
                                        onChange={(e) => setsettingPrecisionPopulation(e.target.value)}
                                        type="number"
                                        id="nodePopulationPrecision"
                                    />
                                </>
                            </>
                            <Dropdown.Divider />
                        </>
                    </>
                    <>
                        <div className="h2 text-primary">
                            TREE
                        </div>
                        <Dropdown.Divider />
                        <>
                            <div className="h5 text-danger">
                                Connector Line
                            </div>
                            <>
                                <Form.Label htmlFor="TreeLineThickness">
                                    <div className="h6">Thickness</div>
                                </Form.Label>
                                <Form.Control
                                    defaultValue={settingTreeLineThickness}
                                    onChange={(e) => setSettingTreeLineThickness(e.target.value)}
                                    type="number"
                                    id="TreeLineThickness"
                                />

                                <Form.Label htmlFor="treeLineColorPicker">
                                    <div className="h6">
                                        Color
                                    </div>
                                </Form.Label>
                                <Form.Control
                                    type="color"
                                    id="treeLineColorPicker"
                                    defaultValue={settingTreeLineColor}
                                    onChange={(e) => setSettingTreeLineColor(e.target.value)}
                                    title="Choose your color"
                                />

                                <div className="container">
                                    <Form.Label>
                                        <div className="h6">
                                            Opacity:
                                        </div>
                                        <div className="h5">
                                            {settingTreeLineColorOpacity}
                                        </div>
                                    </Form.Label>
                                    <Form.Range defaultValue={settingTreeLineColorOpacity} onChange={(e) => { setSettingTreeLineColorOpacity(e.target.value) }} />
                                </div>
                            </>
                            <Dropdown.Divider />
                        </>

                    </>
                    <>
                        <div className="h2 text-primary">
                            MISCELLANEOUS
                        </div>
                        <Dropdown.Divider />
                        <>
                            <div className="h5 text-danger">
                                Zoom
                            </div>
                            <>
                                <Form.Label htmlFor="ZoomIntensity">
                                    <div className="h6">Intensity</div>
                                </Form.Label>
                                <Form.Control
                                    defaultValue={settingZoomIntensity}
                                    onChange={(e) => setSettingZoomIntensity(e.target.value)}
                                    type="number"
                                    id="ZoomIntensity"
                                />
                            </>
                        </>
                        <Dropdown.Divider />
                    </>

                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

function ProfileOffCanvas({ name, ...props }) {
    const [show, setShow] = useState(false);
    const { projectName, username, projectDescription } = DataState();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="light" onClick={handleShow} className="me-2">
                {name}
            </Button>
            <Offcanvas show={show} onHide={handleClose} {...props}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title><div>{username}</div></Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div>
                        <div className="h2 text-primary">
                            {projectName}
                        </div>
                        <div className="h5 text-dark">
                            {projectDescription}
                        </div>
                    </div>


                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default TopNavigationBar;