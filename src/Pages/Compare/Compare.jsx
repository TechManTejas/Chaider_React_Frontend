import React, { useState, useEffect } from "react"
import axios from "axios"
import { DataState } from "../../Context/Context"
import { useNavigate } from "react-router-dom";
import { Stage, Layer, Group, Rect, Text, Line } from 'react-konva'
import './FeatureButton.css'
import './InstancesPanel.css'
import './Compare.css'
import TrendsMenu from "../../Components/TrendsMenu/TrendsMenu"
import ModalDetailsPanel from "../../Components/DetailsPanel/DetailsPanel"
import ModalTrends from "../../Components/Trends/Trends"
import MobileDevice from "../../Components/MobileDevicesNote/MobileDevicesNote";
import { Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSitemap } from '@fortawesome/free-solid-svg-icons'
import { Toaster } from 'react-hot-toast';
import logger from '../../Log/logger'
import {  urlVisualisation } from '../../backendURLs'

var allStageData = {}
//Contants Decided On Start
var node_width = 200;
var x_difference = node_width / 8;
var line_width = node_width / 25;
var fontNodeName = node_width / 8;
var fontPopulationPercentage = node_width / 8;
var fontNodeContent = node_width / 10;
var fontChildrenCategory = node_width / 7;

// INSTANCE A
var currentStageDataA = {}
var yVarCardinalityA = 0;
var nodesDataA = []
var idOnNodeA;
let IDsA = [0];
let parentChildrenNodesA = [];
let nodesMapA = [[0]];
var node_heightA = node_width / 1.75;
var y_differenceA = node_heightA;

// INSTANCE A
var currentStageDataB = {}
var yVarCardinalityB = 0;
var nodesDataB = []
var idOnNodeB;
let IDsB = [0];
let parentChildrenNodesB = [];
let nodesMapB = [[0]];
var node_heightB = node_width / 1.75;
var y_differenceB = node_heightA;


function Compare() {

    const navigate = useNavigate();

    const [stageScale, setStageScale] = useState(1);
    const [stageX, setStageX] = useState(0);
    const [stageY, setStageY] = useState(0);

    const stageRefA = React.useRef(null);
    const stageRefB = React.useRef(null);

    const [instanceA, setInstanceA] = useState("")
    const [instanceB, setInstanceB] = useState("")
    const [xVarNodesA, setXVarNodesA] = useState([])
    const [xVarNodesB, setXVarNodesB] = useState([])
    const [linesA, setLinesA] = useState([])
    const [linesB, setLinesB] = useState([])

    // Main Node
    let x0 = window.innerWidth / 2 - node_width / 2;
    let y0 = 60;

    const { setSettingNodeHeight, setSettingNodeWidth, settingNodeColor,
        settingNodePopulationPerColor, settingNodeXVariableColor, settingNodeTitleFontSize, setSettingNodeTitleFontSize, settingNodeTitleFontColor, settingNodePopulationPerFontSize,
        setSettingNodePopulationPerFontSize, settingNodePopulationPerFontColor, settingNodeXVariableFontSize, setSettingNodeXVariableFontSize, settingNodeXVariableFontColor,
        settingNodeContentFontSize, setSettingNodeContentFontSize, settingNodeContentFontColor, settingPrecisionContent, settingPrecisionPopulation,
        settingTreeLineThickness, setSettingTreeLineThickness, settingTreeLineColor, setSettingTreeXDifference,
        setSettingTreeYDifference, setSettingDistBetTwoSibNodeGroup, settingZoomIntensity,
        settingNodeColorOpacity, settingNodePopulationPerColorOpacity, settingNodeXVariableColorOpacity, settingNodeTitleFontColorOpacity,
        settingNodePopulationPerFontColorOpacity, settingNodeXVariableFontColorOpacity, settingNodeContentFontColorOpacity, settingTreeLineColorOpacity, stageRef, handTool,
        setSelectedVar, setId, setHandTool,
        settingPCLassDisplay, settingZScoreDisplay, settingChiSquareDisplay, settingRSquareDisplay, settingAdjustedRSquareDisplay, settingGiniDisplay,
        detectMob, setInstanceNames, instanceNames
    } = DataState();

    var statsValueDisplayVars = [settingPCLassDisplay, settingZScoreDisplay, settingChiSquareDisplay, settingRSquareDisplay, settingAdjustedRSquareDisplay, settingGiniDisplay]
    var positionPlacer = 0

    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
    const [showTrendstMenu, setShowTrendsMenu] = useState(false);

    const [trendNodes, setTrendNodes] = useState([]);
    const [detailsData, setDetailsData] = useState({});
    const [D3Data, setD3Data] = useState([]);
    const [DATA, setDATA] = useState([]);

    const getProjectDataA = () => {

        var _id = localStorage.getItem("CurrentProjectId")
        const url = urlVisualisation + `${_id}/`;

        var _local_instance = localStorage.getItem("instanceA")
        if (!_local_instance) {
            setInstanceA("Main")
        } else {
            setInstanceA(_local_instance)
        }

        axios.get(url, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("AccessToken")}`
            }
        }).then(({ data }) => {

            allStageData = data.stageData
            currentStageDataA = allStageData[instanceA]
            setInstanceNames(data.instances.names)
            yVarCardinalityA = currentStageDataA.yVarCardinality
            setXVarNodesA(currentStageDataA.xVarNodes)
            nodesDataA = currentStageDataA.nodesData
            setLinesA(currentStageDataA.lines)

            IDsA = currentStageDataA.IDs
            parentChildrenNodesA = currentStageDataA.parentChildrenNodes
            nodesMapA = currentStageDataA.nodesMap

            setSelectedVar(currentStageDataA.xVarNodes[0].nodeCategory)
            node_heightA = 30 + ((y_differenceA / 3) * (yVarCardinalityA));
        });
    };

    const getProjectDataB = () => {

        var _id = localStorage.getItem("CurrentProjectId")
        const url = urlVisualisation + `${_id}/`;

        var _local_instance = localStorage.getItem("instanceB")
        if (!_local_instance) {
            setInstanceB("Main")
        } else {
            setInstanceB(_local_instance)
        }

        axios.get(url, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("AccessToken")}`
            }
        }).then(({ data }) => {

            allStageData = data.stageData
            currentStageDataB = allStageData[instanceB]
            setInstanceNames(data.instances.names)
            yVarCardinalityB = currentStageDataB.yVarCardinality
            setXVarNodesB(currentStageDataB.xVarNodes)
            nodesDataB = currentStageDataB.nodesData
            setLinesB(currentStageDataB.lines)

            IDsB = currentStageDataB.IDs
            parentChildrenNodesB = currentStageDataB.parentChildrenNodes
            nodesMapB = currentStageDataB.nodesMap

            setSelectedVar(currentStageDataB.xVarNodes[0].nodeCategory)
            node_heightB = 30 + ((y_differenceB / 3) * (yVarCardinalityB));
        });
    };

    const [userlog, setUserlog] = useState(false);
    useEffect(() => {

        setHandTool("grab")

        const Token = localStorage.getItem("AccessToken");
        if (!Token) {
            navigate("/")
            return;
        }

        var _id = localStorage.getItem("CurrentProjectId")
        setId(_id);

        nodesDataA = []
        IDsA = [0];
        parentChildrenNodesA = [];
        nodesMapA = [[0]];

        nodesDataB = []
        IDsB = [0];
        parentChildrenNodesB = [];
        nodesMapB = [[0]];

        setSettingNodeHeight(node_heightA);
        setSettingTreeYDifference(y_differenceA);
        setSettingNodeWidth(node_width);
        setSettingTreeXDifference(x_difference);
        setSettingTreeLineThickness(line_width);
        setSettingDistBetTwoSibNodeGroup(2);
        setSettingNodeTitleFontSize(fontNodeName);
        setSettingNodePopulationPerFontSize(fontPopulationPercentage);
        setSettingNodeContentFontSize(fontNodeContent)
        setSettingNodeXVariableFontSize(fontChildrenCategory);

        setXVarNodesA([]);
        setLinesA([])
        setXVarNodesB([]);
        setLinesB([])

        getProjectDataA()
        getProjectDataB()

    }, [userlog, instanceA, instanceB])

    const openDetailMenuA = (e) => {
        e.evt.preventDefault();
        idOnNodeA = e.target.parent['attrs']['nodeID']
        logger.info("Id on node to open details: " + JSON.stringify(idOnNodeA))

        var _d3Data = []
        logger.info("Data in D3 accepted format: " + JSON.stringify(_d3Data))
        nodesDataA[IDsA.indexOf(idOnNodeA)].values.forEach((kv) => {
            _d3Data.push(
                {
                    data: kv[0],
                    value: kv[1]
                }
            )
        })

        setDATA(nodesDataA[IDsA.indexOf(idOnNodeA)].nodeData)

        setD3Data([..._d3Data])
        setDetailsData(nodesDataA[IDsA.indexOf(idOnNodeA)])

        handleShowDetails()
    }

    const openTrendsMenuA = (e) => {
        e.evt.preventDefault();
        setAnchorPoint({ x: e.evt.pageX, y: e.evt.pageY });
        setDetailsData(nodesDataA[IDsA.indexOf(idOnNodeA)])
        let trendNodes = []
        parentChildrenNodesA.forEach((pc) => {
            if (pc[0] == idOnNodeA) {
                pc[1].forEach((nodeId) => {
                    trendNodes.push(nodesDataA[IDsA.indexOf(nodeId)])
                })
            }
        })
        console.log(trendNodes)
        setTrendNodes(trendNodes)

        setShowTrendsMenu(true);
    }

    const showTrendsA = (e) => {
        e.preventDefault();
        handleShowTrendDetails()
    }

    function showTreeA() {
        var mapHeight = (nodesMapA.length + 1) * (node_heightA + (y_differenceA * 2))
        var mapWidth = ((nodesMapA[0].length + 1) * (node_width + x_difference)) / 2
        logger.info("mapHeight: " + JSON.stringify(mapHeight))
        logger.info("mapWidth: " + JSON.stringify(mapWidth))

        var scaleBy;
        if (mapWidth / window.innerWidth > mapHeight / window.innerHeight) {
            scaleBy = window.innerWidth / mapWidth
        } else {
            scaleBy = window.innerHeight / mapHeight
        }

        stageRefA.current.scale({ x: scaleBy, y: scaleBy })
        logger.info("Scale of Map: " + JSON.stringify(scaleBy))

        var zerothIndex = nodesMapA[0].indexOf(0)
        var startXPos = x0 - ((zerothIndex) * ((node_width + x_difference) / 2))
        var xPos = (window.innerWidth / 2) - ((mapWidth) / 2 + startXPos) * scaleBy
        var yPos = (window.innerHeight / 2) - (scaleBy * (mapHeight / 2))
        stageRefA.current.position({ x: xPos, y: yPos });
        logger.info("Position of Map: { x = " + JSON.stringify(xPos) + " , y = " + JSON.stringify(yPos) + " }")
    }

    const openDetailMenuB = (e) => {
        e.evt.preventDefault();
        idOnNodeB = e.target.parent['attrs']['nodeID']

        var _d3Data = []
        nodesDataB[IDsB.indexOf(idOnNodeB)].values.forEach((kv) => {
            _d3Data.push(
                {
                    data: kv[0],
                    value: kv[1]
                }
            )
        })

        setDATA(nodesDataB[IDsB.indexOf(idOnNodeB)].nodeData)

        setD3Data([..._d3Data])
        setDetailsData(nodesDataB[IDsB.indexOf(idOnNodeB)])

        handleShowDetails()
    }

    const openTrendsMenuB = (e) => {
        e.evt.preventDefault();
        setAnchorPoint({ x: e.evt.pageX, y: e.evt.pageY });
        setDetailsData(nodesDataB[IDsB.indexOf(idOnNodeB)])
        let trendNodes = []
        parentChildrenNodesB.forEach((pc) => {
            if (pc[0] == idOnNodeB) {
                pc[1].forEach((nodeId) => {
                    trendNodes.push(nodesDataB[IDsB.indexOf(nodeId)])
                })
            }
        })
        console.log(trendNodes)
        setTrendNodes(trendNodes)

        setShowTrendsMenu(true);
    }

    const showTrendsB = (e) => {
        e.preventDefault();
        handleShowTrendDetails()
    }

    function showTreeB() {
        var mapHeight = (nodesMapB.length + 1) * (node_heightB + (y_differenceB * 2))
        var mapWidth = ((nodesMapB[0].length + 1) * (node_width + x_difference)) / 2
        logger.info("mapHeight: " + JSON.stringify(mapHeight))
        logger.info("mapWidth: " + JSON.stringify(mapWidth))

        var scaleBy;
        if (mapWidth / window.innerWidth > mapHeight / window.innerHeight) {
            scaleBy = window.innerWidth / mapWidth
        } else {
            scaleBy = window.innerHeight / mapHeight
        }

        stageRefB.current.scale({ x: scaleBy, y: scaleBy })
        logger.info("Scale of Map: " + JSON.stringify(scaleBy))

        var zerothIndex = nodesMapB[0].indexOf(0)
        var startXPos = x0 - ((zerothIndex) * ((node_width + x_difference) / 2))
        var xPos = (window.innerWidth / 2) - ((mapWidth) / 2 + startXPos) * scaleBy
        var yPos = (window.innerHeight / 2) - (scaleBy * (mapHeight / 2))
        stageRefB.current.position({ x: xPos, y: yPos });
        logger.info("Position of Map: { x = " + JSON.stringify(xPos) + " , y = " + JSON.stringify(yPos) + " }")
    }

    const [showDetails, setShowDetails] = useState(false);
    const handleCloseDetails = () => setShowDetails(false);
    const handleShowDetails = () => setShowDetails(true);

    const [showTrendDetails, setShowTrendDetails] = useState(false);
    const handleCloseTrendDetails = () => setShowTrendDetails(false);
    const handleShowTrendDetails = () => setShowTrendDetails(true);

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
                    <div className="d-flex">

                        <div className="w-50" style={{ cursor: handTool }}>
                            <Toaster
                                position="top-center"
                                reverseOrder={false}
                            />
                            <div id="visualisation">
                                <Stage
                                    ref={stageRefA}
                                    scaleX={stageScale}
                                    scaleY={stageScale}
                                    x={stageX}
                                    y={stageY}
                                    offsetX={window.innerWidth / 4}
                                    width={window.innerWidth / 2}
                                    height={window.innerHeight}
                                    onClick={() => {
                                        setShowTrendsMenu(false)
                                    }}
                                    draggable={true}

                                    onMouseDown={(e) => {
                                        if (handTool === "grab") {
                                            setHandTool("grabbing")
                                    }}}
                                    onMouseUp={(e) => {
                                        if (handTool === "grabbing") {
                                            setHandTool("grab")
                                    }}}

                                    onWheel={(e) => {
                                        
                                            e.evt.preventDefault();

                                            var scaleBy = settingZoomIntensity;
                                            var stage = e.target.getStage();
                                            var oldScale = stage.scaleX();
                                            var pointer = stage.getPointerPosition();

                                            const mousePointTo = {
                                                x: (pointer.x - stage.x()) / oldScale,
                                                y: (pointer.y - stage.y()) / oldScale
                                            };

                                            const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

                                            stage.scale({ x: newScale, y: newScale });

                                            var newPos = {
                                                x: pointer.x - mousePointTo.x * newScale,
                                                y: pointer.y - mousePointTo.y * newScale,
                                            };

                                            stage.position(newPos);
                                        
                                    }}
                                >
                                    <Layer>
                                        {
                                            linesA.map((line) => {
                                                return (
                                                    <Line
                                                        key={line.key}
                                                        points={line.points}
                                                        stroke={(line.highlighted) ? "white" : settingTreeLineColor}
                                                        strokeWidth={settingTreeLineThickness}
                                                        opacity={settingTreeLineColorOpacity / 100}
                                                        tension={10}
                                                    />
                                                )
                                            })
                                        }
                                        {
                                            xVarNodesA.map((node) => {
                                                return (
                                                    <Group
                                                        nodeID={node.key}
                                                        nodeName={node.nodeName}
                                                        nodeCategory={node.nodeCategory}
                                                        key={node.key}
                                                        onDblClick={(e) => { openDetailMenuA(e) }}
                                                    >
                                                        <>
                                                            <Rect
                                                                x={node.x}
                                                                y={node.y}
                                                                width={node.width}
                                                                height={node.height}
                                                                fill={(node.highlighted) ? "skyblue" : (node.nodeType === "RANGED") ? "#000080" : (node.nodeType === "PACKED") ? "#800000" : settingNodeColor}
                                                                shadowBlur={node.shadowBlur * 2}
                                                                shadowColor={"black"}
                                                                shadowOffsetY={2}
                                                                opacity={settingNodeColorOpacity / 100}
                                                            />
                                                            <Text
                                                                x={node.x}
                                                                y={node.y}
                                                                fontSize={settingNodeTitleFontSize}
                                                                fill={(node.highlighted) ? "black" : settingNodeTitleFontColor}
                                                                opacity={settingNodeTitleFontColorOpacity / 100}
                                                                text={node.text}
                                                                align="center"
                                                                verticalAlign="middle"
                                                                width={node.width}
                                                                height={30}
                                                                wrap={"none"}
                                                            />
                                                            {
                                                                <>
                                                                    <Rect
                                                                        x={node.x}
                                                                        y={node.y}
                                                                        width={node.width}
                                                                        height={-node.width / 8.5}
                                                                        fill={(node.highlighted) ? "#FFD500" : settingNodePopulationPerColor}
                                                                        opacity={settingNodePopulationPerColorOpacity / 100}
                                                                        shadowBlur={node.shadowBlur * 1.25}
                                                                        shadowColor={"black"}
                                                                    />
                                                                    <Rect
                                                                        x={node.x}
                                                                        y={node.y + node.height}
                                                                        width={node.width}
                                                                        height={node.width / 20}
                                                                        opacity={(node.total / node.pTotal)}
                                                                        fill={"white"}
                                                                        shadowBlur={node.shadowBlur * 1.25}
                                                                        shadowColor={"black"}
                                                                    />
                                                                    <Text
                                                                        x={node.x}
                                                                        y={node.y - node.width / 8.5}
                                                                        fontSize={settingNodePopulationPerFontSize}
                                                                        fill={(node.highlighted) ? "black" : settingNodePopulationPerFontColor}
                                                                        opacity={settingNodePopulationPerFontColorOpacity / 100}
                                                                        text={((node.total * 100) / node.pTotal).toPrecision(settingPrecisionPopulation) + "% (" + node.total + ")"}
                                                                        align="center"
                                                                        width={node.width}
                                                                        wrap={"none"}
                                                                    />
                                                                </>
                                                            }
                                                            {node.values.map((kv) => {
                                                                return (
                                                                    <>
                                                                        <Text
                                                                            x={node.x}
                                                                            y={node.y + ((y_differenceA / 3) * (node.values.indexOf(kv))) + 30}
                                                                            fontSize={settingNodeContentFontSize}
                                                                            fill={(node.highlighted) ? "black" : settingNodeContentFontColor}
                                                                            opacity={settingNodeContentFontColorOpacity / 100}
                                                                            text={kv[0] + ":" + kv[1].toString()}
                                                                            align="center"
                                                                            width={node.width / 2}
                                                                            wrap={"none"}
                                                                        />
                                                                        <Text
                                                                            x={node.x + node.width / 2}
                                                                            y={node.y + ((y_differenceA / 3) * (node.values.indexOf(kv))) + 30}
                                                                            fontSize={settingNodeContentFontSize}
                                                                            fill={(node.highlighted) ? "black" : settingNodeContentFontColor}
                                                                            opacity={settingNodeContentFontColorOpacity / 100}
                                                                            text={(((kv[1]) / (node.total)) * 100).toPrecision(settingPrecisionContent) + "%"}
                                                                            align="center"
                                                                            width={node.width / 2}
                                                                            wrap={"none"}
                                                                        />
                                                                        <Rect
                                                                            x={node.x + ((node.width * 3) / 4)}
                                                                            y={node.y + ((y_differenceA / 3) * (node.values.indexOf(kv))) + 50}
                                                                            width={node.width / 4}
                                                                            height={node.width / 25}
                                                                            offsetX={node.width / 8}
                                                                            fill={"#51ff0d"}
                                                                            opacity={((kv[1]) / (node.total))}
                                                                        />
                                                                    </>
                                                                )
                                                            })}
                                                        </>
                                                    </Group>
                                                )
                                            })
                                        }
                                        {
                                            xVarNodesA.map((node) => {
                                                return (
                                                    <Group
                                                        key={node.key}
                                                        onContextMenu={(e) => {
                                                            idOnNodeA = node.key
                                                            openTrendsMenuA(e)
                                                        }}
                                                    >
                                                        {
                                                            (node.childrenCategory !== "") &&
                                                            <>
                                                                <Rect
                                                                    x={node.x}
                                                                    y={node.y + node.height + (y_differenceA / 3)}
                                                                    width={node.width}
                                                                    height={y_differenceA / 4}
                                                                    cornerRadius={3}
                                                                    fill={settingNodeXVariableColor}
                                                                    opacity={settingNodeXVariableColorOpacity / 100}
                                                                    shadowBlur={node.shadowBlur}
                                                                    shadowOffsetY={2}
                                                                />
                                                                <Text
                                                                    wrap={"none"}
                                                                    x={node.x}
                                                                    y={node.y + node.height + (y_differenceA / 3)}
                                                                    fontSize={settingNodeXVariableFontSize}
                                                                    fill={settingNodeXVariableFontColor}
                                                                    opacity={settingNodeXVariableFontColorOpacity / 100}
                                                                    text={node.childrenCategory}
                                                                    align="center"
                                                                    width={node.width}
                                                                />
                                                                {
                                                                    Object.keys(node.statisticalValues).map((sv, i) => {
                                                                        return (
                                                                            <>{statsValueDisplayVars[i] &&
                                                                                <>
                                                                                    <Text
                                                                                        x={node.x}
                                                                                        y={node.y + node.height + (y_differenceA / 3) * (2 + (0.4 * (positionPlacer)))}
                                                                                        fontSize={settingNodeContentFontSize * 0.7}
                                                                                        fontStyle={"bold"}
                                                                                        fill={"black"}
                                                                                        opacity={settingNodeContentFontColorOpacity / 100}
                                                                                        text={sv + ":  "}
                                                                                        align="right"
                                                                                        width={node.width / 2}
                                                                                        wrap={"none"}
                                                                                    />
                                                                                    <Text
                                                                                        x={node.x + node.width / 2}
                                                                                        y={node.y + node.height + (y_differenceA / 3) * (2 + (0.4 * (positionPlacer++)))}
                                                                                        fontSize={settingNodeContentFontSize * 0.7}
                                                                                        fontStyle={"bold"}
                                                                                        fill={"black"}
                                                                                        opacity={settingNodeContentFontColorOpacity / 100}
                                                                                        text={"  " + node.statisticalValues[sv]}
                                                                                        align="left"
                                                                                        width={node.width / 2}
                                                                                        wrap={"none"}
                                                                                    />
                                                                                </>
                                                                            }
                                                                            </>
                                                                        )
                                                                    }, positionPlacer = 0)
                                                                }
                                                            </>
                                                        }
                                                    </Group>
                                                )
                                            })
                                        }
                                    </Layer>

                                </Stage>

                            </div>

                            <TrendsMenu showTrendstMenu={showTrendstMenu} anchorPoint={anchorPoint} showTrends={showTrendsA} />

                            <ModalDetailsPanel showDetails={showDetails} handleCloseDetails={handleCloseDetails} detailsData={detailsData} D3Data={D3Data} DATA={DATA} />

                            <ModalTrends showDetails={showTrendDetails} handleCloseDetails={handleCloseTrendDetails} detailsData={detailsData} trendNodes={trendNodes} />

                            <div style={{
                                position: "absolute",
                                top: "10px",
                                left: "10px",
                            }}>
                                <Dropdown>
                                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                                        {instanceA}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {instanceNames.map((name, i) => {
                                            return (
                                                <>
                                                    <Dropdown.Item onClick={() => {
                                                        localStorage.setItem("instanceA", name)
                                                        setInstanceA(name)
                                                    }}>
                                                        {name}
                                                    </Dropdown.Item>
                                                </>
                                            )
                                        })}

                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                            {/* <div style={{
                                position: "absolute",
                                top: "15px",
                                right: window.innerWidth/2 + 65,
                            }}>
                                <div class="featureButton d-flex flex-column" >
                                    <Button variant=""
                                        onClick={showTreeA}
                                        tooltip="Show Tree"
                                    >
                                        <FontAwesomeIcon icon={faSitemap} />
                                    </Button>

                                </div>
                            </div> */}

                        </div>

                        <div className="w-50" style={{ cursor: handTool }}>
                            <Toaster
                                position="top-center"
                                reverseOrder={false}
                            />
                            <div id="visualisation">
                                <Stage
                                    ref={stageRefB}
                                    scaleX={stageScale}
                                    scaleY={stageScale}
                                    x={stageX}
                                    offsetX={window.innerWidth / 4}
                                    y={stageY}
                                    width={window.innerWidth / 2}
                                    height={window.innerHeight}
                                    onClick={() => {
                                        setShowTrendsMenu(false)
                                    }}
                                    draggable={true}

                                    onMouseDown={(e) => {
                                        if (handTool === "grab") {
                                            setHandTool("grabbing")
                                        }
                                    }}
                                    onMouseUp={(e) => {
                                        if (handTool === "grabbing") {
                                            setHandTool("grab")
                                        }
                                    }}

                                    onWheel={(e) => {
                                        
                                            e.evt.preventDefault();

                                            var scaleBy = settingZoomIntensity;
                                            var stage = e.target.getStage();
                                            var oldScale = stage.scaleX();
                                            var pointer = stage.getPointerPosition();

                                            const mousePointTo = {
                                                x: (pointer.x - stage.x()) / oldScale,
                                                y: (pointer.y - stage.y()) / oldScale
                                            };

                                            const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

                                            stage.scale({ x: newScale, y: newScale });

                                            var newPos = {
                                                x: pointer.x - mousePointTo.x * newScale,
                                                y: pointer.y - mousePointTo.y * newScale,
                                            };

                                            stage.position(newPos);
                                        
                                    }}
                                >
                                    <Layer>
                                        {
                                            linesB.map((line) => {
                                                return (
                                                    <Line
                                                        key={line.key}
                                                        points={line.points}
                                                        stroke={(line.highlighted) ? "white" : settingTreeLineColor}
                                                        strokeWidth={settingTreeLineThickness}
                                                        opacity={settingTreeLineColorOpacity / 100}
                                                        tension={10}
                                                    />
                                                )
                                            })
                                        }
                                        {
                                            xVarNodesB.map((node) => {
                                                return (
                                                    <Group
                                                        nodeID={node.key}
                                                        nodeName={node.nodeName}
                                                        nodeCategory={node.nodeCategory}
                                                        key={node.key}

                                                        onDblClick={(e) => { openDetailMenuB(e) }}
                                                    >
                                                        <>
                                                            <Rect
                                                                x={node.x}
                                                                y={node.y}
                                                                width={node.width}
                                                                height={node.height}
                                                                fill={(node.highlighted) ? "skyblue" : (node.nodeType === "RANGED") ? "#000080" : (node.nodeType === "PACKED") ? "#800000" : settingNodeColor}
                                                                shadowBlur={node.shadowBlur * 2}
                                                                shadowColor={"black"}
                                                                shadowOffsetY={2}
                                                                opacity={settingNodeColorOpacity / 100}
                                                            />
                                                            <Text
                                                                x={node.x}
                                                                y={node.y}
                                                                fontSize={settingNodeTitleFontSize}
                                                                fill={(node.highlighted) ? "black" : settingNodeTitleFontColor}
                                                                opacity={settingNodeTitleFontColorOpacity / 100}
                                                                text={node.text}
                                                                align="center"
                                                                verticalAlign="middle"
                                                                width={node.width}
                                                                height={30}
                                                                wrap={"none"}
                                                            />
                                                            {
                                                                <>
                                                                    <Rect
                                                                        x={node.x}
                                                                        y={node.y}
                                                                        width={node.width}
                                                                        height={-node.width / 8.5}
                                                                        fill={(node.highlighted) ? "#FFD500" : settingNodePopulationPerColor}
                                                                        opacity={settingNodePopulationPerColorOpacity / 100}
                                                                        shadowBlur={node.shadowBlur * 1.25}
                                                                        shadowColor={"black"}
                                                                    />
                                                                    <Rect
                                                                        x={node.x}
                                                                        y={node.y + node.height}
                                                                        width={node.width}
                                                                        height={node.width / 20}
                                                                        opacity={(node.total / node.pTotal)}
                                                                        fill={"white"}
                                                                        shadowBlur={node.shadowBlur * 1.25}
                                                                        shadowColor={"black"}
                                                                    />
                                                                    <Text
                                                                        x={node.x}
                                                                        y={node.y - node.width / 8.5}
                                                                        fontSize={settingNodePopulationPerFontSize}
                                                                        fill={(node.highlighted) ? "black" : settingNodePopulationPerFontColor}
                                                                        opacity={settingNodePopulationPerFontColorOpacity / 100}
                                                                        text={((node.total * 100) / node.pTotal).toPrecision(settingPrecisionPopulation) + "% (" + node.total + ")"}
                                                                        align="center"
                                                                        width={node.width}
                                                                        wrap={"none"}
                                                                    />
                                                                </>
                                                            }
                                                            {node.values.map((kv) => {
                                                                return (
                                                                    <>
                                                                        <Text
                                                                            x={node.x}
                                                                            y={node.y + ((y_differenceB / 3) * (node.values.indexOf(kv))) + 30}
                                                                            fontSize={settingNodeContentFontSize}
                                                                            fill={(node.highlighted) ? "black" : settingNodeContentFontColor}
                                                                            opacity={settingNodeContentFontColorOpacity / 100}
                                                                            text={kv[0] + ":" + kv[1].toString()}
                                                                            align="center"
                                                                            width={node.width / 2}
                                                                            wrap={"none"}
                                                                        />
                                                                        <Text
                                                                            x={node.x + node.width / 2}
                                                                            y={node.y + ((y_differenceB / 3) * (node.values.indexOf(kv))) + 30}
                                                                            fontSize={settingNodeContentFontSize}
                                                                            fill={(node.highlighted) ? "black" : settingNodeContentFontColor}
                                                                            opacity={settingNodeContentFontColorOpacity / 100}
                                                                            text={(((kv[1]) / (node.total)) * 100).toPrecision(settingPrecisionContent) + "%"}
                                                                            align="center"
                                                                            width={node.width / 2}
                                                                            wrap={"none"}
                                                                        />
                                                                        <Rect
                                                                            x={node.x + ((node.width * 3) / 4)}
                                                                            y={node.y + ((y_differenceB / 3) * (node.values.indexOf(kv))) + 50}
                                                                            width={node.width / 4}
                                                                            height={node.width / 25}
                                                                            offsetX={node.width / 8}
                                                                            fill={"#51ff0d"}
                                                                            opacity={((kv[1]) / (node.total))}
                                                                        />
                                                                    </>
                                                                )
                                                            })}
                                                        </>
                                                    </Group>
                                                )
                                            })
                                        }
                                        {
                                            xVarNodesB.map((node) => {
                                                return (
                                                    <Group
                                                        key={node.key}
                                                        onContextMenu={(e) => {
                                                            idOnNodeB = node.key
                                                            openTrendsMenuB(e)
                                                        }}
                                                    >
                                                        {
                                                            (node.childrenCategory !== "") &&
                                                            <>
                                                                <Rect
                                                                    x={node.x}
                                                                    y={node.y + node.height + (y_differenceB / 3)}
                                                                    width={node.width}
                                                                    height={y_differenceB / 4}
                                                                    cornerRadius={3}
                                                                    fill={settingNodeXVariableColor}
                                                                    opacity={settingNodeXVariableColorOpacity / 100}
                                                                    shadowBlur={node.shadowBlur}
                                                                    shadowOffsetY={2}
                                                                />
                                                                <Text
                                                                    wrap={"none"}
                                                                    x={node.x}
                                                                    y={node.y + node.height + (y_differenceB / 3)}
                                                                    fontSize={settingNodeXVariableFontSize}
                                                                    fill={settingNodeXVariableFontColor}
                                                                    opacity={settingNodeXVariableFontColorOpacity / 100}
                                                                    text={node.childrenCategory}
                                                                    align="center"
                                                                    width={node.width}
                                                                />
                                                                {
                                                                    Object.keys(node.statisticalValues).map((sv, i) => {
                                                                        return (
                                                                            <>{statsValueDisplayVars[i] &&
                                                                                <>
                                                                                    <Text
                                                                                        x={node.x}
                                                                                        y={node.y + node.height + (y_differenceB / 3) * (2 + (0.4 * (positionPlacer)))}
                                                                                        fontSize={settingNodeContentFontSize * 0.7}
                                                                                        fontStyle={"bold"}
                                                                                        fill={"black"}
                                                                                        opacity={settingNodeContentFontColorOpacity / 100}
                                                                                        text={sv + ":  "}
                                                                                        align="right"
                                                                                        width={node.width / 2}
                                                                                        wrap={"none"}
                                                                                    />
                                                                                    <Text
                                                                                        x={node.x + node.width / 2}
                                                                                        y={node.y + node.height + (y_differenceB / 3) * (2 + (0.4 * (positionPlacer++)))}
                                                                                        fontSize={settingNodeContentFontSize * 0.7}
                                                                                        fontStyle={"bold"}
                                                                                        fill={"black"}
                                                                                        opacity={settingNodeContentFontColorOpacity / 100}
                                                                                        text={"  " + node.statisticalValues[sv]}
                                                                                        align="left"
                                                                                        width={node.width / 2}
                                                                                        wrap={"none"}
                                                                                    />
                                                                                </>
                                                                            }
                                                                            </>
                                                                        )
                                                                    }, positionPlacer = 0)
                                                                }
                                                            </>
                                                        }
                                                    </Group>
                                                )
                                            })
                                        }
                                    </Layer>

                                </Stage>

                            </div>

                            <TrendsMenu showTrendstMenu={showTrendstMenu} anchorPoint={anchorPoint} showTrends={showTrendsB} />

                            <ModalDetailsPanel showDetails={showDetails} handleCloseDetails={handleCloseDetails} detailsData={detailsData} D3Data={D3Data} DATA={DATA} />

                            <ModalTrends showDetails={showTrendDetails} handleCloseDetails={handleCloseTrendDetails} detailsData={detailsData} trendNodes={trendNodes} />

                            <div style={{
                                position: "absolute",
                                top: "10px",
                                left: window.innerWidth/2 + 10,
                            }}>
                                <Dropdown>
                                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                                        {instanceB}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {instanceNames.map((name, i) => {
                                            return (
                                                <>
                                                    <Dropdown.Item onClick={() => {
                                                        localStorage.setItem("instanceB", name)
                                                        setInstanceB(name)
                                                    }}>
                                                        {name}
                                                    </Dropdown.Item>
                                                </>
                                            )
                                        })}

                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                            {/* <div style={{
                                position: "absolute",
                                top: "15px",
                                right: 65,
                            }}>
                                <div class="featureButton d-flex flex-column" >
                                    <Button variant=""
                                        onClick={showTreeB}
                                        tooltip="Show Tree"
                                    >
                                        <FontAwesomeIcon icon={faSitemap} />
                                    </Button>

                                </div>
                            </div> */}
                        
                        </div>

                        <div style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                        }}>
                            <Button variant="danger"
                                onClick={() => {
                                    navigate("/Visualisation")
                                }}
                                tooltip="Show Tree"
                            >
                                BACK
                            </Button>
                        </div>

                    </div>
                    :
                    <MobileDevice />
                }
            </>
        );
    } catch (error) {
        return <ErrorFallback error={error} />
    }
}

export default Compare;

