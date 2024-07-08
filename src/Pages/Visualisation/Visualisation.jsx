import React, { useState, useEffect } from "react"
import TopNavigationBar from "./Components/NavbarVisualisation"
import axios from "axios"
import { DataState } from "../../Context/Context"
import { useNavigate } from "react-router-dom";
import { Stage, Layer, Group, Rect, Text, Line } from 'react-konva'
import './FeatureButton.css'
import './InstancesPanel.css'
import './Visualisation.css'
import LivePieChart from "../../Components/LivePieChart/LivePieChart";
import Pen from "../../Components/Annotations/Pen"
import Eraser from "../../Components/Annotations/Eraser"
import TrendsMenu from "../../Components/TrendsMenu/TrendsMenu"
import CustomContextMenu from "../../Components/ContextMenu/CustomContextMenu"
import ModalXVarSelect from "../../Components/ModalXVarSelect/ModalXVarSelect"
import ModalYVarSelect from "../../Components/ModalYVarSelect/ModalYVarSelect";
import ModalDetailsPanel from "../../Components/DetailsPanel/DetailsPanel"
import ModalTrends from "../../Components/Trends/Trends"
import PromptSaveInstance from "../../Components/PromptSaveInstance/PromptSaveInstance"
import MobileDevice from "../../Components/MobileDevicesNote/MobileDevicesNote";
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSitemap, faY, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import toast, { Toaster } from 'react-hot-toast';
import logger from '../../Log/logger'
import { urlUsers, urlVisualisation } from '../../backendURLs'
import FilterData from "../../Components/FilterData/FilterData";

var allStageData = {}
var currentStageData = {}
var currentInstance;
var yVarCardinality = 0;

var nodesData = []
var linesData = []
var headLinesData = []
var tailLinesData = []
var sibingLinesData = []
var mappingData = []
var operation;

var idOnNode;
var firstNodeSibling;
var firstNodeType;
var varsTillNode = []
var xVariablesTillNode = []
var nodeTypesTillNode = []
var nodeDataTillNode = []

let currentIDonNode = 1
var url;

let currentID = 1;
var linesKeyCount = 0;
let IDs = [0];
let parentNodes = [];
let parentChildrenNodes = [];
// Below are the Nested array in javascripts.
let siblingNodes = [[0]];
let nodesInRows = [[0]];
let nodesTree = [[[0]]];
let spreadInTree = [[[1]]];
let nodesMap = [[0]];

//Contants Decided On Start
var node_width = 200;
var x_difference = node_width / 8;
var line_width = node_width / 25;

var node_height = node_width / 1.75;
var y_difference = node_height;

var nodeShadowBlur = 3;
var fontNodeName = node_width / 8;
var fontPopulationPercentage = node_width / 8;
var fontNodeContent = node_width / 10;
var fontChildrenCategory = node_width / 7;

var _stageRef;

var testCases = [];
function saveTestCases() {
    let body = "[\n"
    testCases.forEach((c) => {
        body += JSON.stringify(c)
        if (testCases.indexOf(c) != testCases.length - 1) {
            body += ',\n'
        }
    })
    body += '\n]'

    var data = "data:text/json;charset=utf-8," + encodeURIComponent(body);
    var tempElement = document.createElement("a");
    tempElement.setAttribute("href", data);

    tempElement.setAttribute("download", "testcases.json");
    tempElement.click();
}
window.addEventListener('keyup', function (event) {
    if (event.ctrlKey && event.key === 'v') {
        saveTestCases()
    }
});

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    logger.info("Converting base64/URLEncoded data component to raw binary data held in a string")
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

export async function saveData(xVarNodes, lines) {

    const uri = _stageRef.current.toDataURL({ pixelRatio: 0.5 });
    logger.info("Converted stage data to uri with pixelRatio: 0.5")
    let data = new FormData();
    data.append('preview', dataURItoBlob(uri), "stage.png");

    const stageData = {
        yVarCardinality,
        xVarNodes,
        nodesData,
        lines,
        linesData,
        headLinesData,
        tailLinesData,
        sibingLinesData,
        currentID,
        linesKeyCount,
        IDs,
        parentNodes,
        parentChildrenNodes,
        siblingNodes,
        nodesInRows,
        nodesTree,
        spreadInTree,
        nodesMap
    };
    allStageData[currentInstance] = stageData;

    data.append('stageData', JSON.stringify(allStageData));
    logger.info("FormData about to post:- " + JSON.stringify(data))
    var _id = localStorage.getItem("CurrentProjectId")
    logger.info("Project id from localStorage:- " + JSON.stringify(_id))
    var url = urlVisualisation + `${_id}/`
    logger.info("URL to save data: " + JSON.stringify(url))
    const res = await axios.patch(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${localStorage.getItem("AccessToken")}`
        }
    })
    return res;
}

export async function resetProject() {

    let data = new FormData();

    allStageData[currentInstance] = {};
    data.append('stageData', JSON.stringify(allStageData));

    var _id = localStorage.getItem("CurrentProjectId")
    logger.info("Project id from localStorage:- " + JSON.stringify(_id))
    var url = urlVisualisation + `${_id}/`
    logger.info("URL to save data: " + JSON.stringify(url))
    const res = await axios.patch(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${localStorage.getItem("AccessToken")}`
        }
    })
}

export function getStageInfoAndSave(xVarNodes, lines) {
    logger.info("Saving Stage data")
    toast.promise(
        saveData(xVarNodes, lines),
        {
            loading: 'Saving...Please do not close the window',
            success: <b>Data Saved Successfully!</b>,
            error: <b>An Error Occurred!</b>,
        }
    );
}

function Visualisation() {

    const navigate = useNavigate();

    const [stageScale, setStageScale] = useState(1);
    const [stageX, setStageX] = useState(0);
    const [stageY, setStageY] = useState(0);

    // Main Node
    let x0 = window.innerWidth / 2 - node_width / 2;
    let y0 = 60;

    const { id, selectedVar, modalVariables, setSettingNodeHeight, setSettingNodeWidth, settingNodeColor,
        settingNodePopulationPerColor, settingNodeXVariableColor, settingNodeTitleFontSize, setSettingNodeTitleFontSize, settingNodeTitleFontColor, settingNodePopulationPerFontSize,
        setSettingNodePopulationPerFontSize, settingNodePopulationPerFontColor, settingNodeXVariableFontSize, setSettingNodeXVariableFontSize, settingNodeXVariableFontColor,
        settingNodeContentFontSize, setSettingNodeContentFontSize, settingNodeContentFontColor, settingPrecisionContent, settingPrecisionPopulation,
        settingTreeLineThickness, setSettingTreeLineThickness, settingTreeLineColor, setSettingTreeXDifference,
        setSettingTreeYDifference, settingDistBetTwoSibNodeGroup, setSettingDistBetTwoSibNodeGroup, settingZoomIntensity,
        settingNodeColorOpacity, settingNodePopulationPerColorOpacity, settingNodeXVariableColorOpacity, settingNodeTitleFontColorOpacity,
        settingNodePopulationPerFontColorOpacity, settingNodeXVariableFontColorOpacity, settingNodeContentFontColorOpacity, settingTreeLineColorOpacity, stageRef, handTool,
        setHandTool, tool, setProjectName, setSelectedVar, setId, setModalVariables, xVarNodes, setXVarNodes, lines, setLines, settingAssistantContainerDisplay,
        setProjectDescription, setUsername, settingPCLassDisplay, settingZScoreDisplay, settingChiSquareDisplay, settingRSquareDisplay, settingAdjustedRSquareDisplay, settingGiniDisplay,
        detectMob, instance, setInstanceNames, setReservedStageData, reservedStageData, setInstance, instanceNames
    } = DataState();

    var statsValueDisplayVars = [settingPCLassDisplay, settingZScoreDisplay, settingChiSquareDisplay, settingRSquareDisplay, settingAdjustedRSquareDisplay, settingGiniDisplay]
    var positionPlacer = 0

    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
    const [showContextMenu, setShowContentMenu] = useState(false);
    const [showTrendstMenu, setShowTrendsMenu] = useState(false);
    const [selectedXVar, setSelectedXVar] = useState("");

    const [trendNodes, setTrendNodes] = useState([]);
    const [detailsData, setDetailsData] = useState({});
    const [D3Data, setD3Data] = useState([]);
    const [DATA, setDATA] = useState([]);
    const [nodeType, setNodeType] = useState('')

    const [opacityAssistantContainer, setOpacityAssistantContainer] = useState(0);
    const [penColor, setPenColor] = useState("#000000")
    const [penSize, setPenSize] = useState(10)
    const [eraserSize, setEraserSize] = useState(100)

    const [mergeNodeToolSelected, setMergeNodeToolSelected] = useState(false)
    const [mergeNodes, setMergeNodes] = useState([])

    function requestFullScreen(element) {
        logger.info("Requesting fullscreen")
        // Supports most browsers and their versions.
        var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

        if (requestMethod) { // Native full screen.
            requestMethod.call(element);
        } else if (typeof (window.ActiveXObject) !== "undefined") { // Older IE.
            var wscript = new window.ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
    }

    const notifyAsyncStatusYVariable = () => {
        logger.info("Fetching data for Y variable")
        toast.promise(
            getYVariableData(),
            {
                loading: 'Fetching Data...',
                success: <b>Done!</b>,
                error: <b>An Error Occurred!</b>,
            }
        );

    };

    const notifyAsyncStatusXVariable = () => {
        logger.info("Fetching data for X variable")
        toast.promise(
            getResponseFromBackend(),
            {
                loading: 'Fetching Data...',
                success: <b>Done!</b>,
                error: <b>An Error Occurred!</b>,
            }
        );
    };

    const getYVariableData = () => {
        logger.info("Chosen Y-variable: " + selectedVar.toString())
        url = urlVisualisation + `${id}/`;
        logger.info("URL to get Y-variable data: " + JSON.stringify(url))

        var data = {
            "firstsplit": 1,
            "csvid": id,
            "operation": "forcesplit",
            "yVar": selectedVar
        }

        logger.info("Posting data:- " + JSON.stringify(data))
        const response = axios.post(url, {
            data: data
        },
            {
                headers: {
                    'Authorization': `Token ${localStorage.getItem("AccessToken")}`
                },
            }).then(({ data }) => {

                logger.info("Y-variable data:" + JSON.stringify(data))

                var _dictKeyValue = []

                Object.keys(data["nodeContent"]).forEach(function (key) {
                    var _tempDict = []
                    _tempDict.push(key)
                    _tempDict.push(data["nodeContent"][key]);
                    _dictKeyValue.push(_tempDict);
                })

                logger.info("Dict Key-Values:- " + JSON.stringify(_dictKeyValue))

                yVarCardinality = _dictKeyValue.length
                node_height = 30 + ((y_difference / 3) * (_dictKeyValue.length));
                logger.info("Calculated node height by cardinality: " + JSON.stringify(node_height));

                nodesData.push(nodeDataTemplate(0, selectedVar, selectedVar, "", x0, y0, node_width, node_height, nodeShadowBlur, selectedVar, data.total, data.total, _dictKeyValue, 0, data["nodeData"], data["nodeType"], ""))
                logger.info("Initialized node template")

                setXVarNodes([...nodesData])
            });
        return response
    }

    const getProjectData = () => {

        const urlUser = urlUsers + `${localStorage.getItem("ChaiderUserId")}/`
        logger.info("url to get user data: " + JSON.stringify(urlUser))

        axios.get(urlUser, {
            headers: { 'Authorization': `Token ${localStorage.getItem("AccessToken")}` }
        }).then(({ data }) => {
            setUsername(data.username);
            logger.info("Username:- " + JSON.stringify(data.username));
        });

        var _id = localStorage.getItem("CurrentProjectId")
        logger.info("Project id from localStorage:- " + JSON.stringify(_id))
        const url = urlVisualisation + `${_id}/`;
        logger.info("url to get project data:- " + JSON.stringify(url))

        var _local_instance = localStorage.getItem("instance")
        if (!_local_instance) {
            setInstance("Main")
        } else {
            setInstance(_local_instance)
        }

        axios.get(url, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("AccessToken")}`
            }
        }).then(({ data }) => {

            allStageData = data.stageData
            setReservedStageData(allStageData)
            currentStageData = allStageData[instance]
            currentInstance = instance
            setInstanceNames(data.instances.names)
            console.log("Instance names: " + JSON.stringify(data.instances.names))
            setProjectDescription(data.description)

            if (!(currentStageData.hasOwnProperty("xVarNodes"))) {
                logger.info("Prompting User to select a Y-variable")
                handleShowYVarSelectModal()
            } else {

                logger.info("Project Data:- " + JSON.stringify(currentStageData))

                yVarCardinality = currentStageData.yVarCardinality
                setXVarNodes(currentStageData.xVarNodes)
                nodesData = currentStageData.nodesData
                setLines(currentStageData.lines)
                linesData = currentStageData.linesData
                headLinesData = currentStageData.headLinesData
                tailLinesData = currentStageData.tailLinesData
                sibingLinesData = currentStageData.sibingLinesData
                currentID = currentStageData.currentID
                linesKeyCount = currentStageData.linesKeyCount
                IDs = currentStageData.IDs
                parentNodes = currentStageData.parentNodes
                parentChildrenNodes = currentStageData.parentChildrenNodes
                siblingNodes = currentStageData.siblingNodes
                nodesInRows = currentStageData.nodesInRows
                nodesTree = currentStageData.nodesTree
                spreadInTree = currentStageData.spreadInTree
                nodesMap = currentStageData.nodesMap

                setSelectedVar(currentStageData.xVarNodes[0].nodeCategory)
                node_height = 30 + ((y_difference / 3) * (yVarCardinality));
                logger.info("Calculated node height by cardinality: " + JSON.stringify(node_height));
            }

            mappingData = []
            if (data.hasOwnProperty('filename') && data.hasOwnProperty('variables')) {

                for (let v in data.variables) {
                    mappingData.push({ "variablename": v, "variablecardinality": data.variables[v] });
                }
                setModalVariables(mappingData);
            }
            logger.info("Variables with Caridinality: " + JSON.stringify(mappingData))
        });
    };

    const [userlog, setUserlog] = useState(false);
    useEffect(() => {

        // Unncomment the following code to get in fullscreen mode at the start of page
        // var elem = document.body;
        // requestFullScreen(elem);

        const Token = localStorage.getItem("AccessToken");
        logger.info("Access token from localStorage: " + JSON.stringify(Token))
        if (!Token) {
            logger.info("Token not found navigating to /")
            navigate("/")
            return;
        }

        var _id = localStorage.getItem("CurrentProjectId")
        logger.info("Project id from localStorage: " + JSON.stringify(_id))
        setId(_id);

        nodesData = []
        linesData = []
        mappingData = []
        varsTillNode = []
        xVariablesTillNode = []
        currentID = 1;
        currentIDonNode = 1
        linesKeyCount = 0;
        IDs = [0];
        parentNodes = [];
        parentChildrenNodes = [];
        siblingNodes = [[0]];
        nodesInRows = [[0]];
        nodesTree = [[[0]]];
        spreadInTree = [[[1]]];
        nodesMap = [[0]];

        setSettingNodeHeight(node_height);
        setSettingNodeWidth(node_width);
        setSettingTreeYDifference(y_difference);
        setSettingTreeXDifference(x_difference);
        setSettingTreeLineThickness(line_width);
        setSettingDistBetTwoSibNodeGroup(2); //Not working
        setSettingNodeTitleFontSize(fontNodeName);
        setSettingNodePopulationPerFontSize(fontPopulationPercentage);
        setSettingNodeContentFontSize(fontNodeContent)
        setSettingNodeXVariableFontSize(fontChildrenCategory);

        setXVarNodes([]);
        headLinesData = []
        tailLinesData = []
        sibingLinesData = []
        setLines([])

        url = urlVisualisation + `${_id}/`
        logger.info("URL to get project information from: " + JSON.stringify(url))
        axios.get(url, {
            headers: { 'Authorization': `Token ${localStorage.getItem("AccessToken")}` }
        }).then(({ data }) => {
            setProjectName(data.name);
            logger.info("Project Name: " + JSON.stringify(data.name));
        });

        logger.log("Fetching Project Data")
        getProjectData()

        _stageRef = stageRef

        // const interval = setInterval(() => {
        //     getStageInfoAndSave(xVarNodes, lines)
        // },120000)

        // return () => clearInterval(interval)
    }, [userlog, instance])

    // Run this in the code where you want to debug anything about the node spacing alogirthm
    function logEverything() {
        console.log(nodesData)
        console.log("IDs: ", IDs);
        console.log("parentNodes: ", parentNodes);
        console.log("parentChildrenNodes: ", parentChildrenNodes);
        console.log("siblingNodes: ", siblingNodes);
        console.log("nodesInRows: ", nodesInRows);
        console.log("nodesTree: ", nodesTree);
        console.log("spreadInTree: ", spreadInTree);
        console.table(nodesMap);
    }

    function plotMap() {

        var zerothIndex = nodesMap[0].indexOf(0);

        var startXPos = x0 - ((zerothIndex) * ((node_width + x_difference) / 2))
        var startYPos = 60
        var iterStarXPos = startXPos

        logger.info("start-x-pos: " + JSON.stringify(startXPos) + " start-y-pos: " + JSON.stringify(startYPos));

        nodesMap.forEach((row) => {
            for (let i = 0; i < row.length; i++) {
                if (row[i] !== "") {
                    nodesData[IDs.indexOf(row[i])].x = iterStarXPos
                    nodesData[IDs.indexOf(row[i])].y = startYPos
                    nodesData[IDs.indexOf(row[i])].key = row[i]
                }
                iterStarXPos += ((node_width + x_difference) / 2);
            }
            iterStarXPos = startXPos;
            startYPos += (node_height + y_difference * 2);
        });

        //RESET LINE 
        linesData = []
        headLinesData = []
        tailLinesData = []
        sibingLinesData = []
        setLines([])

        //head wire for all nodes except the y var node
        nodesData.slice(1).forEach((node) => {
            headLinesData.push(
                {
                    "key": linesKeyCount++,
                    "targetNode": node["key"],
                    "highlighted": 0,
                    "points": [
                        node.x + (node_width / 2), node.y - (y_difference / 5),
                        node.x + (node_width / 2), node.y - (y_difference / 2) - (line_width / 2)
                    ]
                }
            );
        })
        logger.info("headLinesData:-")
        logger.info(JSON.stringify(headLinesData));

        //lower wire for parent nodes (vertical)
        parentNodes.forEach((parentNodeID) => {
            var node = nodesData[IDs.indexOf(parentNodeID)]
            tailLinesData.push(
                {
                    "key": linesKeyCount++,
                    "targetNode": parentNodeID,
                    "highlighted": 0,
                    "points": [
                        node.x + (node_width / 2), node.y + node_height,
                        node.x + (node_width / 2), node.y + node_height + (y_difference * 1.5)
                    ]
                }
            );
        })
        logger.info("tailLinesData:-")
        logger.info(JSON.stringify(tailLinesData));

        //horizontal wire for sibbling nodes (horizontal)
        siblingNodes.slice(1).forEach((siblingNodesGroups) => {

            var nodeStart = nodesData[IDs.indexOf(siblingNodesGroups[0])]
            var nodeEnd = nodesData[IDs.indexOf(siblingNodesGroups[siblingNodesGroups.length - 1])]

            var centerPointX;

            parentChildrenNodes.forEach((P_children) => {
                if (P_children[1].toString() === siblingNodesGroups.toString()) {
                    centerPointX = nodesData[IDs.indexOf(P_children[0])]['x'] + (node_width / 2)
                }
            })
            var centerPointY = nodeEnd.y - (y_difference / 2)

            for (var i = 0; i < siblingNodesGroups.length; i++) {
                nodeStart = nodesData[IDs.indexOf(siblingNodesGroups[i])]
                nodeEnd = nodesData[IDs.indexOf(siblingNodesGroups[i + 1])]
                sibingLinesData.push(
                    {
                        "key": linesKeyCount++,
                        "targetNode": siblingNodesGroups[i],
                        "highlighted": 0,
                        "points": [
                            (nodeStart.x + (node_width / 2)), nodeStart.y - (y_difference / 2),
                            centerPointX, centerPointY
                        ]
                    }
                );
            }
        })
        logger.info("sibingLinesData:-")
        logger.info(JSON.stringify(sibingLinesData));

        linesData = [...headLinesData, ...tailLinesData, ...sibingLinesData];
        setLines([...linesData])
    }

    function leftWhiteSpaceRemover() {
        for (let i = 0; i < nodesMap[0].length; i++) {
            var count = 0;
            for (let j = 0; j < nodesMap.length; j++) {
                if (nodesMap[j][1] === "") {
                    count += 1;
                }
            }

            if (count === nodesMap.length) {
                for (let j = 0; j < nodesMap.length; j++) {
                    nodesMap[j].splice(1, 1);
                }
            } else {
                break;
            }
        }
    }

    function rightWhiteSpaceRemover() {
        for (let i = 0; i < nodesMap[0].length; i++) {
            var count = 0;
            var lastIndex = nodesMap[0].length - 1 - 1;
            for (let j = 0; j < nodesMap.length; j++) {
                if (nodesMap[j][lastIndex] == "") {
                    count += 1;
                }
            }

            if (count == nodesMap.length) {
                for (let j = 0; j < nodesMap.length; j++) {
                    nodesMap[j].splice(lastIndex, 1);
                }
            } else {
                break;
            }
        }

    }

    function betweenWhiteSpaceRemover() {
        var tempNodesMap = nodesMap;
        tempNodesMap = transpose(tempNodesMap);

        for (var i = 0; i < tempNodesMap.length - 2; i++) {
            if (
                tempNodesMap[i].every((val) => val === "") &&
                tempNodesMap[i + 1].every((val) => val === "") &&
                tempNodesMap[i + 2].every((val) => val === "")
            ) {
                tempNodesMap.splice(i, 1);
                i--;

                nodesMap = transpose(tempNodesMap);
            }
        }
    }

    function bottomWhiteSpaceRemover() {
        for (let i = nodesMap.length - 1 - 1; i > 0; i--) {
            var count = 0;
            for (let j = 0; j < nodesMap[0].length; j++) {
                if (nodesMap[i][j] == "") {
                    count += 1;
                }
            }

            if (count == nodesMap[0].length) {
                nodesMap.splice(i, 1);
            } else {
                break;
            }
        }

    }

    function transpose(arr) {
        let temp2d = [];
        for (let i = 0; i < arr[0].length; i++) {
            let row = [];
            for (let j = 0; j < arr.length; j++) {
                row.push(arr[j][i]);
            }
            temp2d.push(row);
        }
        return temp2d;
    }

    var spreadMap = 1;
    var absoluteMapCount = 0;
    var mapCount = 0;

    function makeMap() {
        var needToSpread = false;
        mapCount++;
        absoluteMapCount++;

        nodesMap = _drawNewSandbox();
        logger.info("Empty nodesMap:-");
        logger.info(JSON.stringify(nodesMap))
        _place0thNodeAtMean();
        logger.info("nodesMap with node 0 at mean position in 0th row:-");
        logger.info(JSON.stringify(nodesMap))

        //Plot the nodeIDs below the 0th node
        for (var i = 0; i < nodesInRows.length - 1; i++) {
            let parents = [];
            nodesInRows[i].forEach((nodeID) => {
                if (parentNodes.includes(nodeID)) {
                    parents.push(nodeID);
                }
            });

            for (let parentNodeIDs of parents) {
                let children = [];
                parentChildrenNodes.forEach((P_children) => {
                    if (P_children[0] === parentNodeIDs) {
                        children = P_children[1];
                    }
                });

                var d2In;
                var d3In;
                nodesTree.forEach((row) => {
                    if (row.includes(children)) {
                        d2In = nodesTree.indexOf(row);
                        d3In = row.indexOf(children);
                    }
                });

                var spreadSiblingAmount = spreadInTree[d2In][d3In][0];
                var parentIndexInMap = nodesMap[i].indexOf(parentNodeIDs);
                var currentChildNodeIndex = _calcCurrentChildNodeIndex(
                    children.length,
                    parentIndexInMap,
                    spreadSiblingAmount
                );
                let plottingIndexes = _calcPlottingIndexes(
                    children.length,
                    currentChildNodeIndex,
                    spreadSiblingAmount
                );

                //Spread the map if the plottingIndexes goes out of map
                if (!needToSpread) {
                    plottingIndexes.forEach((index) => {
                        if (index < 0 || index > nodesMap[i].length - 1) {
                            needToSpread = true;
                            logger.info("Plotting indexes went out of map, need to increase spread of branch")
                        }
                    });
                }
                // Spread the map if there are nodes present in the indexes already or between them
                if (!needToSpread) {
                    let rangeToCheck = [
                        plottingIndexes[0] - settingDistBetTwoSibNodeGroup,
                        plottingIndexes[plottingIndexes.length - 1] +
                        settingDistBetTwoSibNodeGroup,
                    ];

                    for (var r = rangeToCheck[0]; r <= rangeToCheck[1]; r++) {
                        if (nodesMap[i + 1][r] !== "") {
                            needToSpread = true;
                            logger.info("Plotting indexes collided with existing nodes in map, need to increase spread of branch")
                            var nodeTofindAncestor = _getParentIdByChildId(nodesMap[i + 1][r]);
                            _getCommonAncestorAndSpreadIt(nodeTofindAncestor, parentNodeIDs);
                            break;
                        }
                    }
                }

                if (needToSpread) {
                    break;
                } else {
                    var childIndex = 0;
                    plottingIndexes.forEach((plotIndex) => {
                        nodesMap[i + 1][plotIndex] = children[childIndex++];
                    });
                }
            }
            if (needToSpread) {
                break;
            }
        }
        if (needToSpread) {
            spreadMap += 2;
            makeMap();
        }

        mapCount--;
        if (mapCount === 0) {
            mapCount = 0;
            leftWhiteSpaceRemover();
            logger.info("Removed whitespace in the left of map")
            rightWhiteSpaceRemover();
            logger.info("Removed whitespace in the right of map")
            betweenWhiteSpaceRemover();
            logger.info("Removed whitespace in between of map")
            bottomWhiteSpaceRemover();
            logger.info("Removed whitespace in bottom of map")

            logger.info("Map function executed " + absoluteMapCount + " times");
            logger.info("New spreads in branches of tree:-");
            logger.info(JSON.stringify(spreadInTree))
            logger.info("nodesMap:-")
            logger.info(JSON.stringify(nodesMap))
            absoluteMapCount = 0

            plotMap();
        }
    }

    function _drawNewSandbox() {
        nodesMap = [];

        var maxNodesRow = -1;
        nodesInRows.forEach((row) => {
            if (row.length > maxNodesRow) {
                maxNodesRow = row.length;
            }
        });
        var columnCount = maxNodesRow;
        var rowCount = nodesInRows.length;

        //Make a sandbox
        for (var i = 0; i < rowCount; i++) {
            let row = [];
            for (var j = 0; j < columnCount * spreadMap; j++) {
                row.push("");
            }
            //last extra spread
            for (var k = 0; k < spreadMap; k++) {
                row.push("");
            }
            nodesMap.push(row);
        }

        return nodesMap;
    }

    function _place0thNodeAtMean() {
        if (nodesMap[0].length % 2 !== 0) {
            nodesMap[0][(nodesMap[0].length - 1) / 2] = 0;
        } else {
            nodesMap[0][nodesMap[0].length / 2] = 0;
        }
    }

    function _calcCurrentChildNodeIndex(
        childrenCount,
        parentIndexInMap,
        spreadSiblingAmount
    ) {
        var _currentChildNodeIndex;
        if (childrenCount % 2 === 0) {
            //Even plottingIndexes
            _currentChildNodeIndex =
                parentIndexInMap -
                (spreadSiblingAmount + 1) / 2 -
                (childrenCount / 2 - 1) * (spreadSiblingAmount + 1);
            logger.log("Plotting index start position for even number of nodes: " + JSON.stringify(_currentChildNodeIndex));
        } else {
            //Odd plottingIndexes
            _currentChildNodeIndex =
                parentIndexInMap - ((childrenCount - 1) / 2) * (spreadSiblingAmount + 1);
            logger.log("Plotting index start position for odd number of nodes: " + JSON.stringify(_currentChildNodeIndex));
        }
        return _currentChildNodeIndex;
    }

    function _calcPlottingIndexes(
        childrenCount,
        currentChildNodeIndex,
        spreadSiblingAmount
    ) {
        let _plottingIndexes = [];
        for (var _ = 0; _ < childrenCount; _++) {
            _plottingIndexes.push(currentChildNodeIndex);
            currentChildNodeIndex += 1 + spreadSiblingAmount;
        }
        logger.info("Plotting indexes:-");
        logger.info(JSON.stringify(_plottingIndexes))
        return _plottingIndexes;
    }

    function _getParentIdByChildId(childNodeID) {
        var _parentNode;
        parentChildrenNodes.forEach((P_children) => {
            if (P_children[1].includes(childNodeID)) {
                _parentNode = P_children[0];
            }
        });
        logger.info("Parent node of " + JSON.stringify(childNodeID) + " is " + JSON.stringify(_parentNode));
        return _parentNode;
    }

    function _getCommonAncestorAndSpreadIt(nodeID1, nodeID2) {
        var siblingToSpread, _2_, _3_;
        var foundAncestor = false;

        siblingNodes.forEach((sib) => {
            if (sib.includes(nodeID1) && sib.includes(nodeID2)) {
                siblingToSpread = sib;
                foundAncestor = true;

                nodesTree.forEach((row) => {
                    row.forEach((s) => {
                        if (JSON.stringify(s) === JSON.stringify(sib)) {
                            _2_ = nodesTree.indexOf(row);
                            _3_ = row.indexOf(s);
                        }
                    })
                });
            }
        });

        if (!foundAncestor) {
            var new_nodeID1 = _getParentIdByChildId(nodeID1);
            var new_nodeID2 = _getParentIdByChildId(nodeID2);
            if (new_nodeID1 !== undefined && new_nodeID2 !== undefined) {
                _getCommonAncestorAndSpreadIt(new_nodeID1, new_nodeID2);
            }
        } else {

            logger.info("Common siblings branch to increase spread to resolve collision: " + JSON.stringify(siblingToSpread))

            var spreadAmount = 0;
            if (siblingToSpread.length % 2 === 0) {
                spreadAmount = 2;
            } else {
                spreadAmount = 1;
            }
            spreadInTree[_2_][_3_][0] += spreadAmount;
        }
    }

    function makeTree() {

        logger.info("Making tree (3d array)")

        spreadInTree = [[[1]]];

        nodesTree.forEach((row) => {

            let parentNodeIDs = [];
            logger.info("Getting parent node ids of all siblings present in row:-");
            logger.info(JSON.stringify(row))

            row.forEach((children) => {
                parentChildrenNodes.forEach((P_children) => {
                    if (P_children[1].toString() === children.toString()) {
                        nodesInRows.forEach((row) => {
                            if (row.includes(P_children[0])) {
                                parentNodeIDs.push([row.indexOf(P_children[0]), P_children[1]]);
                            }
                        });
                    }
                });
            });

            parentNodeIDs.sort(function (a, b) {
                if (a[0] === b[0]) {
                    return 0;
                } else {
                    return a[0] < b[0] ? -1 : 1;
                }
            });
            logger.info("Sorted parentNodeIds in increasing order");

            if (parentNodeIDs.length > 0) {
                let new_row_in_tree = [];
                let new_spreads_in_tree = [];
                let new_row_in_nodesInRows = [];

                parentNodeIDs.forEach((index_children) => {
                    new_row_in_tree.push(index_children[1]);
                    new_spreads_in_tree.push([1]);
                    index_children[1].forEach((nodeID) => {
                        new_row_in_nodesInRows.push(nodeID);
                    });
                });

                nodesTree[nodesTree.indexOf(row)] = new_row_in_tree;
                spreadInTree[nodesTree.indexOf(new_row_in_tree)] = new_spreads_in_tree;
                nodesInRows[nodesTree.indexOf(new_row_in_tree)] = new_row_in_nodesInRows;

                logger.info("New nodesTree:-")
                logger.info(JSON.stringify(nodesTree))
                logger.info("New spreadInTree:-")
                logger.info(JSON.stringify(spreadInTree))
                logger.info("New nodesInRows:-")
                logger.info(JSON.stringify(nodesInRows))
            }
        });

    }

    function addNodes(nodeID, noOfNodes) {
        if (nodesInRows[nodesInRows.length - 1].includes(nodeID)) {
            nodesInRows.push([]);
            nodesTree.push([]);
            logger.info("Added new empty row [] in nodesInRows as row is not available to add node ids:-")
            logger.info(JSON.stringify(nodesInRows))
        }

        let _sibbling_nodes = [];

        var rowNum;
        for (let i = 0; i < noOfNodes; i++) {
            nodesInRows.forEach((row) => {
                if (row.includes(nodeID)) {
                    rowNum = nodesInRows.indexOf(row);
                    nodesInRows[rowNum + 1].push(currentID);
                }
            });

            IDs.push(currentID);
            _sibbling_nodes.push(currentID);

            currentID += 1;
        }

        logger.info("nodesInRows:-");
        logger.info(JSON.stringify(nodesInRows))

        parentNodes.push(nodeID);
        logger.info("Added " + JSON.stringify(nodeID) + " in parentNodes");
        logger.info("parentNodes:-")
        logger.info(JSON.stringify(parentNodes))

        parentChildrenNodes.push([nodeID, _sibbling_nodes]);
        logger.info("Added " + JSON.stringify([nodeID, _sibbling_nodes]) + " to parentChildrenNodes");
        logger.info("parentChildrenNodes:-")
        logger.info(JSON.stringify(parentChildrenNodes))

        siblingNodes.push(_sibbling_nodes);
        logger.info("Added " + JSON.stringify(_sibbling_nodes) + " in siblingNodes");
        logger.info("siblingNodes:-")
        logger.info(JSON.stringify(siblingNodes))

        nodesTree[rowNum + 1].push(_sibbling_nodes);
        logger.info("Added " + JSON.stringify(_sibbling_nodes) + " in nodesTree");
        logger.info("nodesTree:-")
        logger.info(JSON.stringify(nodesTree))

        makeTree();

        makeMap();

    }

    var nodesToRemove = [];
    var count = 0;
    function removeNodes(nodeNumber) {
        logger.info("Removing nodes under:-", JSON.stringify(nodeNumber));

        nodesData[IDs.indexOf(nodeNumber)]["childrenCategory"] = ""
        count++;

        if (parentNodes.includes(nodeNumber)) {
            var index_ClickedRect = parentNodes.indexOf(nodeNumber);
            parentNodes.splice(index_ClickedRect, 1);
        }
        logger.log("Removed node id from parentNodes")

        let childrenOfParent = [];

        parentChildrenNodes.forEach((P_children) => {
            if (P_children[0] === nodeNumber) {
                childrenOfParent = P_children[1];
                logger.log("Children of node: " + JSON.stringify(nodeNumber) + " are: " + JSON.stringify(childrenOfParent))

                childrenOfParent.forEach((child) => {
                    nodesToRemove.push(child);
                });

                parentChildrenNodes.splice(parentChildrenNodes.indexOf(P_children), 1);
                logger.log("Removed node id from parentChildrenNodes")

                var splicingIndex;
                siblingNodes.forEach((sib) => {
                    if (JSON.stringify(sib) === JSON.stringify(childrenOfParent)) {
                        splicingIndex = siblingNodes.indexOf(sib)
                    }
                })
                siblingNodes.splice(splicingIndex, 1);
                logger.log("Removed node id from siblingNodes")

                nodesInRows.forEach((rowNodes) => {
                    for (let i = 0; i < rowNodes.length; i++) {
                        if (childrenOfParent.includes(rowNodes[i])) {
                            var index_node = rowNodes.indexOf(rowNodes[i]);
                            rowNodes.splice(index_node, 1);
                            i -= 1;
                        }
                    }
                });
                logger.log("Removed node id from node")

                nodesTree.forEach((rowNodes) => {
                    rowNodes.forEach((sibGroup) => {
                        if (sibGroup === childrenOfParent) {
                            nodesTree[nodesTree.indexOf(rowNodes)].splice(
                                rowNodes.indexOf(sibGroup),
                                1
                            );
                        }
                    });
                });
                logger.log("Removed node id from nodesTree")
            }
        });

        logger.info("Passing every node in childrenOfParent as a parent in recursion to check remove their respective children")
        childrenOfParent.forEach((childAsParent) => {
            logger.log("Child as parent: " + JSON.stringify(childAsParent))
            removeNodes(childAsParent);
        });

        count--;

        if (count === 0) {
            logger.info("Nodes to remove", JSON.stringify(nodesToRemove));

            nodesToRemove.forEach((node) => {
                var index = IDs.indexOf(node);
                nodesData.splice(index, 1);
                IDs.splice(index, 1);
            });
            nodesToRemove = [];
            logger.log("Removed node ids from nodesData and IDs")

            setXVarNodes([...nodesData])
            makeTree();
            makeMap();

            logger.info("Nodes deleted successfully")
        }
    }

    function removeNode(nodeId) {
        nodesData.splice(IDs.indexOf(nodeId), 1)
        setXVarNodes(nodesData)

        IDs.splice(IDs.indexOf(nodeId), 1)
        parentChildrenNodes.forEach((P_C) => {
            if (P_C[1].includes(nodeId)) {
                var index = parentChildrenNodes.indexOf(P_C)
                parentChildrenNodes[index][1].splice(P_C[1].indexOf(nodeId), 1)
            }
        })

        siblingNodes.forEach((sib) => {
            if (sib.includes(nodeId)) {
                sib.splice(sib.indexOf(nodeId), 1);
            }
        })

        nodesInRows.forEach((rowNodes) => {
            if (rowNodes.includes(nodeId)) {
                rowNodes.splice(rowNodes.indexOf(nodeId), 1)
            }
        });
    }

    const openDetailMenu = (e) => {
        e.evt.preventDefault();
        idOnNode = e.target.parent['attrs']['nodeID']
        logger.info("Id on node to open details: " + JSON.stringify(idOnNode))

        var _d3Data = []
        logger.info("Data in D3 accepted format: " + JSON.stringify(_d3Data))
        nodesData[IDs.indexOf(idOnNode)].values.forEach((kv) => {
            _d3Data.push(
                {
                    data: kv[0],
                    value: kv[1]
                }
            )
        })

        setDATA(nodesData[IDs.indexOf(idOnNode)].nodeData)
        setNodeType(nodesData[IDs.indexOf(idOnNode)].nodeType)

        setD3Data([..._d3Data])
        setDetailsData(nodesData[IDs.indexOf(idOnNode)])

        handleShowDetails()
    }

    const openContextMenu = (e) => {
        e.evt.preventDefault();
        setAnchorPoint({ x: e.evt.pageX, y: e.evt.pageY });
        setShowContentMenu(true);

        idOnNode = e.target.parent['attrs']['nodeID']
        logger.info("Id on node to perform operation on: " + JSON.stringify(idOnNode))

        varsTillNode = []
        xVariablesTillNode = []
        nodeTypesTillNode = []
        nodeDataTillNode = []

        var currentNodeID = idOnNode
        while (currentNodeID != 0) {

            var varName = nodesData[IDs.indexOf(currentNodeID)]['nodeName']
            if (!isNaN(varName) && varName.toString().indexOf('.') != -1) {
                varName = parseFloat(varName).toFixed(1)
            }

            var varCategory = nodesData[IDs.indexOf(currentNodeID)]['nodeCategory']
            var varType = nodesData[IDs.indexOf(currentNodeID)]['nodeType']
            var varData = nodesData[IDs.indexOf(currentNodeID)]['nodeData']

            varsTillNode.push(varName);
            xVariablesTillNode.push(varCategory);
            nodeTypesTillNode.push(varType);
            nodeDataTillNode.push(varData);

            parentChildrenNodes.forEach(P_children => {
                if (P_children[1].includes(currentNodeID)) {
                    currentNodeID = P_children[0]
                }
            })
        }

        varsTillNode.reverse()
        xVariablesTillNode.reverse()
        nodeTypesTillNode.reverse();
        nodeDataTillNode.reverse();

        logger.info("Names on nodes till selected node: ", JSON.stringify(varsTillNode))
        logger.info("X-Variables of nodes till selected node: ", JSON.stringify(xVariablesTillNode))
        logger.info("Node types till selected node: ", JSON.stringify(nodeTypesTillNode))
        logger.info("Node data till selected node: ", JSON.stringify(nodeDataTillNode))
    }

    const openTrendsMenu = (e) => {
        e.evt.preventDefault();
        setAnchorPoint({ x: e.evt.pageX, y: e.evt.pageY });
        setDetailsData(nodesData[IDs.indexOf(idOnNode)])
        let trendNodes = []
        parentChildrenNodes.forEach((pc) => {
            if (pc[0] == idOnNode) {
                pc[1].forEach((nodeId) => {
                    trendNodes.push(nodesData[IDs.indexOf(nodeId)])
                })
            }
        })
        console.log(trendNodes)
        setTrendNodes(trendNodes)

        setShowTrendsMenu(true);
    }

    const showTrends = (e) => {
        e.preventDefault();
        handleShowTrendDetails()
    }

    const showAssistantContainer = (e) => {
        e.evt.preventDefault();
        var idOnNode = e.target.parent['attrs']['nodeID']
        // logger.info("Id on node to show pie chart: " + JSON.stringify(idOnNode))

        var _d3Data = []
        // logger.info("Data in D3 accepted format: " + JSON.stringify(_d3Data))

        nodesData[IDs.indexOf(idOnNode)].values.forEach((kv) => {
            _d3Data.push(
                {
                    data: kv[0],
                    value: kv[1]
                }
            )
        })

        setD3Data([..._d3Data])
        setDetailsData(nodesData[IDs.indexOf(idOnNode)])
        setOpacityAssistantContainer(1);
    }

    const hideAssistantContainer = (e) => {
        setOpacityAssistantContainer(1);
    }

    const forceSplit = () => {
        if (!parentNodes.includes(idOnNode)) {
            logger.info("User selected ForceSplit Operation")
            operation = 'forcesplit';
            mappingData = modalVariables
            handleShowVariables()
            setShowContentMenu(false);
        } else {
            logger.info("Cannot perform forceSplit, node already have children")
        }
    }

    const findSplit = () => {
        if (!parentNodes.includes(idOnNode)) {
            logger.info("User selected FindSplit Operation")
            operation = 'findsplit';

            var postData = {
                data: {
                    "csvid": id,
                    "operation": operation,
                    "varsTillNode": varsTillNode,
                    "xVariablesTillNode": xVariablesTillNode,
                    "nodeTypesTillNode": nodeTypesTillNode,
                    "nodeDataTillNode": nodeDataTillNode,
                    "yVar": selectedVar,
                }
            }

            logger.info("Data about to post:- ")
            logger.info(JSON.stringify(postData))

            const response = axios.post(url, postData,
                {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem("AccessToken")}`
                    },
                }).then(({ data }) => {

                    logger.info("Data recieved from backend:- ")
                    logger.info(JSON.stringify(data))

                    logger.info(
                        JSON.stringify(
                            {
                                request: postData,
                                expectedResponse: {
                                    data: {
                                        nodes: data["nodes"]
                                    }
                                }
                            }
                        )
                    )

                    testCases.push({
                        request: postData,
                        expectedResponse: {
                            data: {
                                nodes: data["nodes"]
                            }
                        }
                    })

                    var nodesList = data["nodes"]
                    var statisticalValues = data["values"]
                    var nodesCount = nodesList.length
                    var addUnderNode = idOnNode

                    for (let nodeNum in nodesList) {

                        var currentNodeData = nodesList[nodeNum]
                        //GET ALL DATA FROM THE NODE
                        var nodeType = currentNodeData["nodeType"]
                        var nodeName = currentNodeData["nodeName"]
                        var nodeCategory = currentNodeData["nodeCategory"]
                        var total = currentNodeData["total"]
                        var nodeContent = currentNodeData["nodeContent"]
                        var Data = currentNodeData["nodeData"]

                        var _dictKeyValue = []
                        Object.keys(nodeContent).forEach(function (key) {
                            var _tempDict = []
                            _tempDict.push(key)
                            _tempDict.push(nodeContent[key]);
                            _dictKeyValue.push(_tempDict);
                        })

                        logger.info("Initialized node template for node: " + JSON.stringify(nodeName))
                        nodesData.push(nodeDataTemplate(-1, nodeName, nodeCategory, "", window.innerWidth / 2 - window.innerWidth / 11, 120, node_width, node_height, nodeShadowBlur, nodeName, total, nodesData[IDs.indexOf(idOnNode)].total, _dictKeyValue, 0, Data, nodeType, ""))
                    }
                    logger.info("Added nodes information to nodesData Variable")
                    logger.info("nodesData: " + JSON.stringify(nodesData))

                    logger.info("Adding " + JSON.stringify(nodesCount) + " nodes under node " + JSON.stringify(addUnderNode))
                    logger.info("Calculating tree spacing...")
                    addNodes(addUnderNode, nodesCount)

                    nodesData[IDs.indexOf(addUnderNode)]["childrenCategory"] = nodeCategory
                    logger.info("Children category of node " + JSON.stringify(addUnderNode) + " is set to: " + JSON.stringify(nodeCategory))
                    nodesData[IDs.indexOf(addUnderNode)]["statisticalValues"] = statisticalValues
                    logger.info("Statistical values of node " + JSON.stringify(addUnderNode) + " are: " + JSON.stringify(statisticalValues))
                    setXVarNodes([...nodesData])
                });

            setShowContentMenu(false);
            return response;
        } else {
            logger.info("Cannot perform findSplit, node already have children")
        }
    }

    const nextSplit = () => {
        var childrenCat = nodesData[IDs.indexOf(idOnNode)]['childrenCategory']
        deleteSubnodes()
        if (!parentNodes.includes(idOnNode)) {
            logger.info("User selected NextSplit Operation")
            operation = 'nextsplit';

            var postData = {
                data: {
                    "csvid": id,
                    "operation": operation,
                    "varsTillNode": varsTillNode,
                    "xVariablesTillNode": xVariablesTillNode,
                    "nodeTypesTillNode": nodeTypesTillNode,
                    "nodeDataTillNode": nodeDataTillNode,
                    "yVar": selectedVar,
                    "childrenCategory": childrenCat
                }
            }

            logger.info("Data about to post:- ")
            logger.info(JSON.stringify(postData))

            const response = axios.post(url, postData,
                {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem("AccessToken")}`
                    },
                }).then(({ data }) => {

                    logger.info("Data recieved from backend:- ")
                    logger.info(JSON.stringify(data))

                    logger.info(
                        JSON.stringify(
                            {
                                request: postData,
                                expectedResponse: {
                                    data: {
                                        nodes: data["nodes"]
                                    }
                                }
                            }
                        )
                    )

                    testCases.push({
                        request: postData,
                        expectedResponse: {
                            data: {
                                nodes: data["nodes"]
                            }
                        }
                    })

                    var nodesList = data["nodes"]
                    var statisticalValues = data["values"]
                    var nodesCount = nodesList.length
                    var addUnderNode = idOnNode

                    for (let nodeNum in nodesList) {

                        var currentNodeData = nodesList[nodeNum]
                        //GET ALL DATA FROM THE NODE
                        var nodeType = currentNodeData["nodeType"]
                        var nodeName = currentNodeData["nodeName"]
                        var nodeCategory = currentNodeData["nodeCategory"]
                        var total = currentNodeData["total"]
                        var nodeContent = currentNodeData["nodeContent"]
                        var Data = currentNodeData["nodeData"]

                        var _dictKeyValue = []
                        Object.keys(nodeContent).forEach(function (key) {
                            var _tempDict = []
                            _tempDict.push(key)
                            _tempDict.push(nodeContent[key]);
                            _dictKeyValue.push(_tempDict);
                        })

                        logger.info("Initialized node template for node: " + JSON.stringify(nodeName))
                        nodesData.push(nodeDataTemplate(-1, nodeName, nodeCategory, "", window.innerWidth / 2 - window.innerWidth / 11, 120, node_width, node_height, nodeShadowBlur, nodeName, total, nodesData[IDs.indexOf(idOnNode)].total, _dictKeyValue, 0, Data, nodeType, ""))
                    }
                    logger.info("Added nodes information to nodesData Variable")
                    logger.info("nodesData: " + JSON.stringify(nodesData))

                    logger.info("Adding " + JSON.stringify(nodesCount) + " nodes under node " + JSON.stringify(addUnderNode))
                    logger.info("Calculating tree spacing...")
                    addNodes(addUnderNode, nodesCount)

                    nodesData[IDs.indexOf(addUnderNode)]["childrenCategory"] = nodeCategory
                    logger.info("Children category of node " + JSON.stringify(addUnderNode) + " is set to: " + JSON.stringify(nodeCategory))
                    nodesData[IDs.indexOf(addUnderNode)]["statisticalValues"] = statisticalValues
                    logger.info("Statistical values of node " + JSON.stringify(addUnderNode) + " are: " + JSON.stringify(statisticalValues))
                    setXVarNodes([...nodesData])
                });

            setShowContentMenu(false);
            return response;
        } else {
            logger.info("Cannot perform nextSplit, node already have children")
        }
    }

    const prevSplit = () => {
        var childrenCat = nodesData[IDs.indexOf(idOnNode)]['childrenCategory']
        deleteSubnodes()
        if (!parentNodes.includes(idOnNode)) {
            logger.info("User selected NextSplit Operation")
            operation = 'prevsplit';

            var postData = {
                data: {
                    "csvid": id,
                    "operation": operation,
                    "varsTillNode": varsTillNode,
                    "xVariablesTillNode": xVariablesTillNode,
                    "nodeTypesTillNode": nodeTypesTillNode,
                    "nodeDataTillNode": nodeDataTillNode,
                    "yVar": selectedVar,
                    "childrenCategory": childrenCat
                }
            }

            logger.info("Data about to post:- ")
            logger.info(JSON.stringify(postData))

            const response = axios.post(url, postData,
                {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem("AccessToken")}`
                    },
                }).then(({ data }) => {

                    logger.info("Data recieved from backend:- ")
                    logger.info(JSON.stringify(data))

                    logger.info(
                        JSON.stringify(
                            {
                                request: postData,
                                expectedResponse: {
                                    data: {
                                        nodes: data["nodes"]
                                    }
                                }
                            }
                        )
                    )

                    testCases.push({
                        request: postData,
                        expectedResponse: {
                            data: {
                                nodes: data["nodes"]
                            }
                        }
                    })

                    var nodesList = data["nodes"]
                    var statisticalValues = data["values"]
                    var nodesCount = nodesList.length
                    var addUnderNode = idOnNode

                    for (let nodeNum in nodesList) {

                        var currentNodeData = nodesList[nodeNum]
                        //GET ALL DATA FROM THE NODE
                        var nodeType = currentNodeData["nodeType"]
                        var nodeName = currentNodeData["nodeName"]
                        var nodeCategory = currentNodeData["nodeCategory"]
                        var total = currentNodeData["total"]
                        var nodeContent = currentNodeData["nodeContent"]
                        var Data = currentNodeData["nodeData"]

                        var _dictKeyValue = []
                        Object.keys(nodeContent).forEach(function (key) {
                            var _tempDict = []
                            _tempDict.push(key)
                            _tempDict.push(nodeContent[key]);
                            _dictKeyValue.push(_tempDict);
                        })

                        logger.info("Initialized node template for node: " + JSON.stringify(nodeName))
                        nodesData.push(nodeDataTemplate(-1, nodeName, nodeCategory, "", window.innerWidth / 2 - window.innerWidth / 11, 120, node_width, node_height, nodeShadowBlur, nodeName, total, nodesData[IDs.indexOf(idOnNode)].total, _dictKeyValue, 0, Data, nodeType, ""))
                    }
                    logger.info("Added nodes information to nodesData Variable")
                    logger.info("nodesData: " + JSON.stringify(nodesData))

                    logger.info("Adding " + JSON.stringify(nodesCount) + " nodes under node " + JSON.stringify(addUnderNode))
                    logger.info("Calculating tree spacing...")
                    addNodes(addUnderNode, nodesCount)

                    nodesData[IDs.indexOf(addUnderNode)]["childrenCategory"] = nodeCategory
                    logger.info("Children category of node " + JSON.stringify(addUnderNode) + " is set to: " + JSON.stringify(nodeCategory))
                    nodesData[IDs.indexOf(addUnderNode)]["statisticalValues"] = statisticalValues
                    logger.info("Statistical values of node " + JSON.stringify(addUnderNode) + " are: " + JSON.stringify(statisticalValues))
                    setXVarNodes([...nodesData])
                });

            setShowContentMenu(false);
            return response;
        } else {
            logger.info("Cannot perform nextSplit, node already have children")
        }
    }

    const treeGrow = () => {
        logger.info("User selected TreeGrow Operation")
        setShowContentMenu(false);
    }

    const deleteSubnodes = () => {
        logger.info("User selected DeleteSubnodes Operation")
        setShowContentMenu(false);

        var currentNodeIDToRemove = idOnNode
        logger.info("Id of node to delete its subnodes: " + JSON.stringify(currentNodeIDToRemove))
        removeNodes(currentNodeIDToRemove);
    }

    const getResponseFromBackend = async () => {

        xVariablesTillNode.push(selectedXVar);
        logger.info("Pushed x-variable to split further in xVariablesTillNode: " + JSON.stringify(selectedXVar))

        var postData = {
            data: {
                "csvid": id,
                "operation": operation,
                "varsTillNode": varsTillNode,
                "xVariablesTillNode": xVariablesTillNode,
                "nodeTypesTillNode": nodeTypesTillNode,
                "nodeDataTillNode": nodeDataTillNode,
                "yVar": selectedVar,
            }
        }

        switch (operation) {
            case 'forcesplit':

                logger.info("Data about to post:- ")
                logger.info(JSON.stringify(postData))

                const response = axios.post(url, postData,
                    {
                        headers: {
                            'Authorization': `Token ${localStorage.getItem("AccessToken")}`
                        },
                    }).then(({ data }) => {

                        logger.info("Data recieved from backend:- ")
                        logger.info(JSON.stringify(data))

                        logger.info(
                            JSON.stringify(
                                {
                                    request: postData,
                                    expectedResponse: {
                                        data: {
                                            nodes: data["nodes"]
                                        }
                                    }
                                }
                            )
                        )

                        testCases.push({
                            request: postData,
                            expectedResponse: {
                                data: {
                                    nodes: data["nodes"]
                                }
                            }
                        })

                        var nodesList = data["nodes"]
                        var statisticalValues = data["values"]
                        var nodesCount = nodesList.length
                        var addUnderNode = idOnNode

                        for (let nodeNum in nodesList) {

                            var currentNodeData = nodesList[nodeNum]
                            //GET ALL DATA FROM THE NODE
                            var nodeType = currentNodeData["nodeType"]
                            var nodeName = currentNodeData["nodeName"]
                            var nodeCategory = currentNodeData["nodeCategory"]
                            var total = currentNodeData["total"]
                            var nodeContent = currentNodeData["nodeContent"]
                            var Data = currentNodeData["nodeData"]

                            var _dictKeyValue = []
                            Object.keys(nodeContent).forEach(function (key) {
                                var _tempDict = []
                                _tempDict.push(key)
                                _tempDict.push(nodeContent[key]);
                                _dictKeyValue.push(_tempDict);
                            })

                            logger.info("Initialized node template for node: " + JSON.stringify(nodeName))
                            nodesData.push(nodeDataTemplate(-1, nodeName, nodeCategory, "", window.innerWidth / 2 - window.innerWidth / 11, 120, node_width, node_height, nodeShadowBlur, nodeName, total, nodesData[IDs.indexOf(idOnNode)].total, _dictKeyValue, 0, Data, nodeType, ""))
                        }
                        logger.info("Added nodes information to nodesData Variable")
                        logger.info("nodesData: " + JSON.stringify(nodesData))

                        logger.info("Adding " + JSON.stringify(nodesCount) + " nodes under node " + JSON.stringify(addUnderNode))
                        logger.info("Calculating tree spacing...")
                        addNodes(addUnderNode, nodesCount)

                        nodesData[IDs.indexOf(addUnderNode)]["childrenCategory"] = nodeCategory
                        logger.info("Children category of node " + JSON.stringify(addUnderNode) + " is set to: " + JSON.stringify(nodeCategory))
                        nodesData[IDs.indexOf(addUnderNode)]["statisticalValues"] = statisticalValues
                        logger.info("Statistical values of node " + JSON.stringify(addUnderNode) + " are: " + JSON.stringify(statisticalValues))
                        setXVarNodes([...nodesData])
                    });

                return response;

            case 'findsplit':
                break;
            case 'nextSplit':
                break;
            case 'treegrow':
                break;
            case 'deletesubnodes':
                break;
            default:
        }
    }

    const [showVariables, setShowVariables] = useState(false);
    const handleCloseVariables = () => setShowVariables(false);
    const handleShowVariables = () => setShowVariables(true);

    const [showDetails, setShowDetails] = useState(false);
    const handleCloseDetails = () => setShowDetails(false);
    const handleShowDetails = () => setShowDetails(true);

    const [showTrendDetails, setShowTrendDetails] = useState(false);
    const handleCloseTrendDetails = () => setShowTrendDetails(false);
    const handleShowTrendDetails = () => setShowTrendDetails(true);

    const [showPromptSave, setShowPromptSave] = useState(false);
    const handleClosePromptSave = () => setShowPromptSave(false);
    const handleShowPromptSave = () => setShowPromptSave(true);

    function afterCompareMode() {
        navigate("/CompareMode")
    }
    function afterChangeInstance(name) {
        setInstance(name)
        localStorage.setItem("instance", name)
    }
    const [afterFunction, setAfterFunction] = useState(() => { });

    const onVarSelect = (v, c) => {
        setSelectedXVar(v);
        setShowVariables(true);
    }

    //UTILITY PART 
    //Draw
    const [drawLines, setDrawLines] = React.useState([]);
    const isDrawing = React.useRef(false);

    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage);
        setDrawLines([...drawLines, { tool, points: [pos.x, pos.y], penSize: (tool == "pen") ? penSize : eraserSize, penColor }]);
    };

    const handleMouseMove = (e) => {
        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }
        const stage = e.target.getStage();
        const point = getRelativePointerPosition(stage);
        let lastLine = drawLines[drawLines.length - 1];
        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // replace last
        drawLines.splice(drawLines.length - 1, 1, lastLine);
        setDrawLines(drawLines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    function getRelativePointerPosition(node) {
        var transform = node.getAbsoluteTransform().copy();
        transform.invert();
        var pos = node.getStage().getPointerPosition();
        return transform.point(pos);
    }

    function getFlowTillNode(e) {
        e.evt.preventDefault();
        var id = e.target.parent['attrs']['nodeID']

        var nodesInFlow = [id]

        var currentNodeID = id
        while (currentNodeID !== 0) {
            parentChildrenNodes.forEach(P_children => {
                if (P_children[1].includes(currentNodeID)) {
                    currentNodeID = P_children[0]
                    nodesInFlow.push(currentNodeID)
                }
            })
        }

        // logger.info("Nodes in flow till node: "+JSON.stringify(id)+" are: "+JSON.stringify(nodesInFlow));
        return nodesInFlow
    }

    function highlightFlow(e) {
        // logger.info("Highlighting Flow")
        if (!mergeNodeToolSelected) {
            var nodesInFlow = getFlowTillNode(e);

            nodesInFlow.forEach((id) => {
                nodesData[IDs.indexOf(id)]['highlighted'] = 1

                headLinesData.forEach((line) => {
                    if (line["targetNode"] === id) {
                        line["highlighted"] = 1
                        var tempHeadLine = line
                        headLinesData.splice(headLinesData.indexOf(line), 1)
                        headLinesData.push(tempHeadLine)
                    }
                })

                if (nodesInFlow.indexOf(id) !== 0) {
                    tailLinesData.forEach((line) => {
                        if (line["targetNode"] === id) {
                            line["highlighted"] = 1
                        }
                    })
                }

                sibingLinesData.forEach((line) => {
                    if (line["targetNode"] === id) {
                        line["highlighted"] = 1
                        var tempSibLine = line
                        sibingLinesData.splice(sibingLinesData.indexOf(line), 1)
                        sibingLinesData.push(tempSibLine)
                    }
                })

            })

            setXVarNodes([...nodesData])

            linesData = [...headLinesData, ...tailLinesData, ...sibingLinesData]
            setLines([...linesData])
        }
    }

    function unhighlightFlow() {
        // logger.info("Unhighlighting Flow")
        if (!mergeNodeToolSelected) {
            nodesData.forEach((node) => {
                node['highlighted'] = 0
            })
            headLinesData.forEach((line) => {
                line["highlighted"] = 0
            })

            tailLinesData.forEach((line) => {
                line["highlighted"] = 0
            })

            sibingLinesData.forEach((line) => {
                line["highlighted"] = 0
            })

            setXVarNodes([...nodesData])
        }
    }

    function showTree() {
        var mapHeight = (nodesMap.length + 1) * (node_height + (y_difference * 2))
        var mapWidth = ((nodesMap[0].length + 1) * (node_width + x_difference)) / 2
        logger.info("mapHeight: " + JSON.stringify(mapHeight))
        logger.info("mapWidth: " + JSON.stringify(mapWidth))

        var scaleBy;
        if (mapWidth / window.innerWidth > mapHeight / window.innerHeight) {
            scaleBy = window.innerWidth / mapWidth
        } else {
            scaleBy = window.innerHeight / mapHeight
        }

        stageRef.current.scale({ x: scaleBy, y: scaleBy })
        logger.info("Scale of Map: " + JSON.stringify(scaleBy))

        var zerothIndex = nodesMap[0].indexOf(0)
        var startXPos = x0 - ((zerothIndex) * ((node_width + x_difference) / 2))
        var xPos = (window.innerWidth / 2) - ((mapWidth) / 2 + startXPos) * scaleBy
        var yPos = (window.innerHeight / 2) - (scaleBy * (mapHeight / 2))
        stageRef.current.position({ x: xPos, y: yPos });
        logger.info("Position of Map: { x = " + JSON.stringify(xPos) + " , y = " + JSON.stringify(yPos) + " }")
    }

    function resetYVar() {
        resetProject()
        logger.info("Reset Project")
        window.location.reload(false);
    }

    function selectNodesToMerge(e) {
        e.evt.preventDefault();
        var id = e.target.parent['attrs']['nodeID']

        if (parentNodes.includes(id))
            return

        if (nodesData[IDs.indexOf(id)]['highlighted'] == 1) {
            console.log("ID: ", id, "MAX: ", Math.max(...mergeNodes), "MIN: ", Math.min(...mergeNodes), "MERGE NODES:", mergeNodes)
            if (firstNodeType == "RANGED") {
                if ((Math.min(...mergeNodes) == id) || ((Math.max(...mergeNodes) == id))) {
                    nodesData[IDs.indexOf(id)]['highlighted'] = 0
                    let nodes = [...mergeNodes]
                    nodes.splice(nodes.indexOf(id), 1)
                    setMergeNodes([...nodes])
                    if (id == firstNodeSibling)
                        firstNodeSibling = mergeNodes[0]
                    return
                }
            }
            else {
                nodesData[IDs.indexOf(id)]['highlighted'] = 0
                let nodes = [...mergeNodes]
                nodes.splice(nodes.indexOf(id), 1)
                setMergeNodes([...nodes])
                if (id == firstNodeSibling)
                    firstNodeSibling = mergeNodes[0]
                return
            }
        }

        if (mergeNodes.length >= 1) {
            siblingNodes.forEach((group) => {
                if (group.includes(id) && group.includes(firstNodeSibling)) {

                    if (firstNodeType == "RANGED")
                        if ((group.indexOf(id) > group.indexOf(Math.max(...mergeNodes)) + 1) ||
                            (group.indexOf(id) < group.indexOf(Math.min(...mergeNodes) - 1)))
                            return

                    if (!(nodesData[IDs.indexOf(id)]['highlighted'])) {
                        nodesData[IDs.indexOf(id)]['highlighted'] = 1
                        setXVarNodes([...nodesData])
                        let new_merge_nodes = [...mergeNodes, id]
                        new_merge_nodes.sort()
                        setMergeNodes([...new_merge_nodes])
                    }
                }
            })
        } else {
            firstNodeSibling = id;
            firstNodeType = nodesData[IDs.indexOf(firstNodeSibling)].nodeType
            nodesData[IDs.indexOf(id)]['highlighted'] = 1
            setXVarNodes([...nodesData])
            setMergeNodes([id])
        }
    }

    function isNumeric(str) {
        if (typeof str != "string") return false
        return !isNaN(str) &&
            !isNaN(parseFloat(str))
    }

    function mergeNodesAndRemakeMap() {
        makeTree();

        var anchorNode = nodesData[IDs.indexOf(firstNodeSibling)]

        if (anchorNode.nodeType == "VALUE") {
            anchorNode.nodeName = anchorNode.nodeCategory + "s " + anchorNode.nodeName + " "
            anchorNode.text = anchorNode.nodeCategory + "s"
            anchorNode.nodeType = "PACKED"

            if (isNumeric(anchorNode.nodeData))
                anchorNode.nodeData = [parseInt(anchorNode.nodeData)]
            else anchorNode.nodeData = [anchorNode.nodeData]

            mergeNodes.forEach((nodeId) => {
                if (nodeId !== firstNodeSibling) {

                    if (nodesData[IDs.indexOf(nodeId)].nodeType == "VALUE") {
                        if (isNumeric(nodesData[IDs.indexOf(nodeId)].nodeData))
                            anchorNode.nodeData.push(parseInt(nodesData[IDs.indexOf(nodeId)].nodeData))
                        else anchorNode.nodeData.push(nodesData[IDs.indexOf(nodeId)].nodeData)

                        anchorNode.nodeName += nodesData[IDs.indexOf(nodeId)].nodeData + " "
                        anchorNode.total += nodesData[IDs.indexOf(nodeId)].total
                        anchorNode.values.map((kv, i) => {
                            anchorNode.values[i][1] += nodesData[IDs.indexOf(nodeId)].values[i][1]
                        })
                    }

                    else if (nodesData[IDs.indexOf(nodeId)].nodeType == "PACKED") {
                        nodesData[IDs.indexOf(nodeId)].nodeData.forEach((data) => {
                            anchorNode.nodeData.push(data)
                            anchorNode.nodeName += nodesData[IDs.indexOf(nodeId)].nodeData + " "
                        })
                        anchorNode.total += nodesData[IDs.indexOf(nodeId)].total
                        anchorNode.values.map((kv, i) => {
                            anchorNode.values[i][1] += nodesData[IDs.indexOf(nodeId)].values[i][1]
                        })
                    }

                }
            })
        }

        else if (anchorNode.nodeType == "PACKED") {
            mergeNodes.forEach((nodeId) => {
                if (nodeId !== firstNodeSibling) {

                    if (nodesData[IDs.indexOf(nodeId)].nodeType == "VALUE") {
                        if (isNumeric(nodesData[IDs.indexOf(nodeId)].nodeData))
                            anchorNode.nodeData.push(parseInt(nodesData[IDs.indexOf(nodeId)].nodeData))
                        else anchorNode.nodeData.push(nodesData[IDs.indexOf(nodeId)].nodeData)

                        anchorNode.total += nodesData[IDs.indexOf(nodeId)].total
                        anchorNode.values.map((kv, i) => {
                            anchorNode.values[i][1] += nodesData[IDs.indexOf(nodeId)].values[i][1]
                        })
                    }

                    else if (nodesData[IDs.indexOf(nodeId)].nodeType == "PACKED") {
                        nodesData[IDs.indexOf(nodeId)].nodeData.forEach((data) => {
                            anchorNode.nodeData.push(data)
                        })
                        anchorNode.total += nodesData[IDs.indexOf(nodeId)].total
                        anchorNode.values.map((kv, i) => {
                            anchorNode.values[i][1] += nodesData[IDs.indexOf(nodeId)].values[i][1]
                        })
                    }

                }
            })
        }

        else if (anchorNode.nodeType == "RANGED") {
            var rangeMin = nodesData[IDs.indexOf(Math.min(...mergeNodes))].nodeData
            var rangeMax = nodesData[IDs.indexOf(Math.max(...mergeNodes))].nodeData
            anchorNode.text = "(" + rangeMin[0] + " , " + rangeMax[1] + "]"
            anchorNode.nodeName = "(" + rangeMin[0] + " , " + rangeMax[1] + "]"
            anchorNode.nodeData = [rangeMin[0], rangeMax[1]]

            mergeNodes.forEach((nodeId) => {
                if (nodeId !== firstNodeSibling) {
                    anchorNode.total += nodesData[IDs.indexOf(nodeId)].total
                    anchorNode.values.map((kv, i) => {
                        anchorNode.values[i][1] += nodesData[IDs.indexOf(nodeId)].values[i][1]
                    })
                }
            })
        }

        nodesData[IDs.indexOf(firstNodeSibling)] = anchorNode

        mergeNodes.forEach((nodeId) => {
            if (nodeId !== firstNodeSibling)
                removeNode(nodeId)
        })

        logEverything()

        makeMap();

        unhighlightFlow()
        setMergeNodes([])
        setMergeNodeToolSelected(false)
    }

    const [showYVarSelectModal, setShowYVarSelectModal] = useState(false);
    const handleCloseYVarSelectModal = () => setShowYVarSelectModal(false);
    const handleShowYVarSelectModal = () => setShowYVarSelectModal(true);

    const [showFilterModal, setShowFilterModal] = useState(true);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);

    const onYVarSelect = (v) => {
        setSelectedVar(v);
    }

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
                    <div>
                        <div style={{ cursor: handTool }}>
                            <TopNavigationBar handleShowPrompt={handleShowPromptSave} />
                            <Toaster
                                position="top-center"
                                reverseOrder={false}
                            />
                            <div id="visualisation">
                                <Stage
                                    ref={stageRef}
                                    scaleX={stageScale}
                                    scaleY={stageScale}
                                    x={stageX}
                                    y={stageY}
                                    width={window.innerWidth}
                                    height={window.innerHeight}
                                    onClick={() => {
                                        setShowContentMenu(false)
                                        setShowTrendsMenu(false)
                                    }}
                                    draggable={(handTool === "grabbing" || handTool === "grab") ? true : false}
                                    onMouseDown={(e) => {
                                        if (handTool === "grab") {
                                            setHandTool("grabbing")
                                        }
                                        if (handTool === "crosshair") {
                                            handleMouseDown(e)
                                        }
                                    }
                                    }
                                    onMousemove={(e) => {
                                        if (handTool === "crosshair") {
                                            handleMouseMove(e)
                                        }
                                    }
                                    }
                                    onMouseUp={(e) => {
                                        if (handTool === "grabbing") {
                                            setHandTool("grab")
                                        }
                                        if (handTool === "crosshair") {
                                            handleMouseUp(e)
                                        }
                                    }
                                    }
                                    onWheel={(e) => {
                                        if (handTool === "grab") {
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
                                        }
                                    }}
                                >
                                    <Layer>
                                        {drawLines.map((line, i) => (
                                            <Line
                                                key={i}
                                                points={line.points}
                                                stroke={line.penColor}
                                                strokeWidth={line.penSize}
                                                tension={0.5}
                                                lineCap="round"
                                                globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"
                                                }
                                            />
                                        ))}
                                    </Layer>
                                    <Layer>
                                        {
                                            lines.map((line) => {
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
                                            xVarNodes.map((node) => {
                                                return (
                                                    <Group
                                                        nodeID={node.key}
                                                        nodeName={node.nodeName}
                                                        nodeCategory={node.nodeCategory}
                                                        key={node.key}

                                                        onContextMenu={(e) => { openContextMenu(e) }}
                                                        onClick={(e) => {
                                                            if (mergeNodeToolSelected) {
                                                                selectNodesToMerge(e)
                                                            }
                                                            var id = e.target.parent['attrs']['nodeID']
                                                            console.log(nodesData[IDs.indexOf(id)])
                                                        }}
                                                        onDblClick={(e) => { openDetailMenu(e) }}

                                                        onMouseOver={(e) => {
                                                            showAssistantContainer(e);
                                                            highlightFlow(e);
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            hideAssistantContainer(e);
                                                            unhighlightFlow(e);
                                                        }}
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
                                                                            y={node.y + ((y_difference / 3) * (node.values.indexOf(kv))) + 30}
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
                                                                            y={node.y + ((y_difference / 3) * (node.values.indexOf(kv))) + 30}
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
                                                                            y={node.y + ((y_difference / 3) * (node.values.indexOf(kv))) + 50}
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
                                            xVarNodes.map((node) => {
                                                return (
                                                    <Group
                                                        key={node.key}
                                                        onContextMenu={(e) => {
                                                            idOnNode = node.key
                                                            openTrendsMenu(e)
                                                        }}
                                                    >
                                                        {
                                                            (node.childrenCategory !== "") &&
                                                            <>
                                                                <Rect
                                                                    x={node.x}
                                                                    y={node.y + node.height + (y_difference / 3)}
                                                                    width={node.width}
                                                                    height={y_difference / 4}
                                                                    cornerRadius={3}
                                                                    fill={settingNodeXVariableColor}
                                                                    opacity={settingNodeXVariableColorOpacity / 100}
                                                                    shadowBlur={node.shadowBlur}
                                                                    shadowOffsetY={2}
                                                                />
                                                                <Text
                                                                    wrap={"none"}
                                                                    x={node.x}
                                                                    y={node.y + node.height + (y_difference / 3)}
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
                                                                                        y={node.y + node.height + (y_difference / 3) * (2 + (0.4 * (positionPlacer)))}
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
                                                                                        y={node.y + node.height + (y_difference / 3) * (2 + (0.4 * (positionPlacer++)))}
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

                            {
                                (settingAssistantContainerDisplay) && <LivePieChart height={window.innerHeight} width={window.innerWidth} D3Data={D3Data} detailsData={detailsData} opacityAssistantContainer={opacityAssistantContainer} settingPrecisionContent={settingPrecisionContent} />
                            }
                            <Pen tool={tool} handTool={handTool} penColor={penColor} setPenColor={setPenColor} pen_eraser_Size={penSize} setPenEraserSize={setPenSize} />

                            <Eraser tool={tool} handTool={handTool} pen_eraser_Size={eraserSize} setPenEraserSize={setEraserSize} />

                            <CustomContextMenu showContextMenu={showContextMenu} anchorPoint={anchorPoint} forceSplit={forceSplit} findSplit={findSplit} nextSplit={nextSplit} prevSplit={prevSplit} treeGrow={treeGrow} deleteSubnodes={deleteSubnodes} />

                            <TrendsMenu showTrendstMenu={showTrendstMenu} anchorPoint={anchorPoint} showTrends={showTrends} />

                            {/* <FilterData showYVarSelectModal={showFilterModal} handleCloseYVarSelectModal={handleCloseFilterModal} modalVariables={modalVariables} /> */}

                            <ModalYVarSelect showYVarSelectModal={showYVarSelectModal} handleCloseYVarSelectModal={handleCloseYVarSelectModal} selectedVar={selectedVar} modalVariables={modalVariables} onYVarSelect={onYVarSelect} notifyAsyncStatusYVariable={notifyAsyncStatusYVariable} />

                            <ModalXVarSelect mappingData={mappingData} showVariables={showVariables} handleCloseVariables={handleCloseVariables} selectedXVar={selectedXVar} onVarSelect={onVarSelect} selectedVar={selectedVar} onXVarConfirmed={notifyAsyncStatusXVariable} />

                            <ModalDetailsPanel showDetails={showDetails} handleCloseDetails={handleCloseDetails} detailsData={detailsData} D3Data={D3Data} DATA={DATA} />

                            <ModalTrends showDetails={showTrendDetails} handleCloseDetails={handleCloseTrendDetails} detailsData={detailsData} trendNodes={trendNodes} />

                            <PromptSaveInstance showPrompt={showPromptSave} handleClosePrompt={handleClosePromptSave} afterFunction={afterFunction} saveFunction={() => getStageInfoAndSave(xVarNodes, lines)} />

                            {(mergeNodes.length > 1) &&
                                <div style={{
                                    position: "absolute",
                                    top: "65px",
                                    left: "10px",
                                }}>
                                    <Button variant="warning"
                                        onClick={mergeNodesAndRemakeMap}
                                        tooltip="Show Tree"
                                    >
                                        MERGE NODES
                                    </Button>
                                </div>
                            }

                            <div style={{
                                position: "absolute",
                                bottom: "10px",
                                right: "10px",
                            }}>
                                <Button variant="danger"
                                    onClick={() => {
                                        setAfterFunction(() => afterCompareMode)
                                        handleShowPromptSave()
                                    }}
                                    tooltip="Show Tree"
                                >
                                    COMPARE MODE
                                </Button>
                            </div>


                            <div style={{
                                position: "absolute",
                                top: "65px",
                                right: "65px",
                            }}>
                                <div class="featureButton d-flex flex-column" >
                                    <Button variant=""
                                        onClick={resetYVar}
                                        tooltip="Show Tree"
                                    >
                                        <FontAwesomeIcon icon={faY} />
                                    </Button>

                                    <Button variant=""
                                        onClick={showTree}
                                        tooltip="Show Tree"
                                    >
                                        <FontAwesomeIcon icon={faSitemap} />
                                    </Button>

                                    <Button variant=""
                                        onClick={() => {
                                            setMergeNodeToolSelected(!mergeNodeToolSelected)
                                            setMergeNodes([])
                                        }}
                                        tooltip="Show Tree"
                                    >
                                        <FontAwesomeIcon icon={faWandMagicSparkles} />
                                    </Button>

                                    {mergeNodeToolSelected &&
                                        <div className="text-center">
                                            Select Nodes to Merge
                                        </div>
                                    }

                                </div>
                            </div>

                            <div class="instancesPanel d-flex" style={{
                                overflowX: 'auto',
                                width: "800px",
                                position: "absolute",
                                bottom: window.innerHeight * 0.01,
                                left: window.innerWidth / 2 - 400,
                            }}>

                                {
                                    instanceNames.map((name) => {
                                        return (
                                            <>
                                                <div>
                                                    <Button
                                                        style={{ width: "200px" }}
                                                        className="mx-1"
                                                        variant="btn btn-success"
                                                        onClick={(e) => {
                                                            if (instance !== name) {
                                                                setAfterFunction(() => () => afterChangeInstance(name))
                                                                handleShowPromptSave()
                                                            }
                                                        }}
                                                        tooltip="Show Tree"
                                                    >
                                                        {name}
                                                    </Button>
                                                </div>
                                            </>
                                        )
                                    })
                                }


                            </div>
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

function nodeDataTemplate(key, nodeName, nodeCategory, childrenCategory, x, y, width, height, shadowBlur, text, total, pTotal, values, highlighted, DATA, nodeType, nodeNote) {
    return (
        {
            key: key,
            nodeName: nodeName,
            nodeCategory: nodeCategory,
            childrenCategory: childrenCategory,
            x: x,
            y: y,
            width: width,
            height: height,
            shadowBlur: shadowBlur,
            text: text,
            total: total,
            pTotal: pTotal,
            values: values,
            highlighted: highlighted,
            nodeData: DATA,
            nodeType: nodeType,
            nodeNote: nodeNote
        })
}

export default Visualisation;

