import React, { createContext, useContext, useState } from "react";
import logger from "../Log/logger"

const Data = createContext()

const DataContext = ({ children }) => {

    const [reservedStageData, setReservedStageData] = useState({})
    const [instanceNames, setInstanceNames] = useState([])
    const [instance, setInstance] = useState("Main")
    const [xVarNodes, setXVarNodes] = useState([]);
    const [lines, setLines] = useState([]);
    const [stageTree, setStageTree] = useState({})
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("")
    const [id, setId] = useState("")
    const [selectedVar, setSelectedVar] = useState("")
    const [projectName, setProjectName] = useState("")
    const [projectDescription, setProjectDescription] = useState("")
    const [modalVariables, setModalVariables] = useState([])
    const [settingAssistantContainerDisplay, setSettingAssistantContainerDisplay] = useState(true);
    const [settingPCLassDisplay, setSettingPCLassDisplay] = useState(true);
    const [settingZScoreDisplay, setSettingZScoreDisplay] = useState(true);
    const [settingChiSquareDisplay, setSettingChiSquareDisplay] = useState(true);
    const [settingRSquareDisplay, setSettingRSquareDisplay] = useState(true);
    const [settingAdjustedRSquareDisplay, setSettingAdjustedRSquareDisplay] = useState(true);
    const [settingGiniDisplay, setSettingGiniDisplay] = useState(true);
    const [settingNodeHeight, setSettingNodeHeight] = useState(0);
    const [settingNodeWidth, setSettingNodeWidth] = useState(0);
    const [settingNodeColor, setSettingNodeColor] = useState("#28282B");
    const [settingNodeColorOpacity, setSettingNodeColorOpacity] = useState(100);
    const [settingNodePopulationPerColor, setSettingNodePopulationPerColor] = useState("#171717");
    const [settingNodePopulationPerColorOpacity, setSettingNodePopulationPerColorOpacity] = useState(60);
    const [settingNodeXVariableColor, setSettingNodeXVariableColor] = useState("#171717");
    const [settingNodeXVariableColorOpacity, setSettingNodeXVariableColorOpacity] = useState(100);
    const [settingNodeTitleFontSize, setSettingNodeTitleFontSize] = useState(0)
    const [settingNodeTitleFontColor, setSettingNodeTitleFontColor] = useState("#C7C7C7")
    const [settingNodeTitleFontColorOpacity, setSettingNodeTitleFontColorOpacity] = useState(100)
    const [settingNodePopulationPerFontSize, setSettingNodePopulationPerFontSize] = useState(0)
    const [settingNodePopulationPerFontColor, setSettingNodePopulationPerFontColor] = useState("#00E0FE")
    const [settingNodePopulationPerFontColorOpacity, setSettingNodePopulationPerFontColorOpacity] = useState(100)
    const [settingNodeXVariableFontSize, setSettingNodeXVariableFontSize] = useState(0)
    const [settingNodeXVariableFontColor, setSettingNodeXVariableFontColor] = useState("#FEBA00")
    const [settingNodeXVariableFontColorOpacity, setSettingNodeXVariableFontColorOpacity] = useState(100)
    const [settingNodeContentFontSize, setSettingNodeContentFontSize] = useState(0)
    const [settingNodeContentFontColor, setSettingNodeContentFontColor] = useState("#FFFFFF")
    const [settingNodeContentFontColorOpacity, setSettingNodeContentFontColorOpacity] = useState(100)
    const [settingPrecisionContent, setsettingPrecisionContent] = useState(4)
    const [settingPrecisionPopulation, setsettingPrecisionPopulation] = useState(4)
    const [settingTreeLineThickness, setSettingTreeLineThickness] = useState(0)
    const [settingTreeLineColor, setSettingTreeLineColor] = useState("#171717")
    const [settingTreeLineColorOpacity, setSettingTreeLineColorOpacity] = useState(100)
    const [settingTreeXDifference, setSettingTreeXDifference] = useState(0)
    const [settingTreeYDifference, setSettingTreeYDifference] = useState(0)
    const [settingDistBetTwoSibNodeGroup, setSettingDistBetTwoSibNodeGroup] = useState(2)
    const [settingBackgroundColor, setSettingBackgroundColor] = useState("#000000")
    const [settingBackgroundColorOpacity, setSettingBackgroundColorOpacity] = useState(100)
    const [settingZoomIntensity, setSettingZoomIntensity] = useState(1.05)

    const [reloader, setReloader] = useState(false)

    //UTILITY PART
    const [tool, setTool] = React.useState("pen");

    //Hand Tool
    const [handTool, setHandTool] = useState("grab")

    //Graphic Tool
    const [graphicTool, setGraphicTool] = useState("none")

    //Download Stage
    const stageRef = React.useRef(null);
    function downloadURI(uri, name) {
        var link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleExport = () => {
        const uri = stageRef.current.toDataURL({pixelRatio: 10});
        logger.info("URI of stage: "+JSON.stringify(uri));
        logger.info("Downloading stage image (pixelRatio: 10)")
        downloadURI(uri, 'stage.png');
    };

    //Mobile Device
    function detectMob() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];

        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    }

    return (
        <Data.Provider value={{
            username, setUsername, email, setEmail, id, setId, selectedVar, setSelectedVar, projectName, setProjectName, projectDescription, setProjectDescription, modalVariables, setModalVariables,
            settingNodeHeight, setSettingNodeHeight, settingNodeWidth, setSettingNodeWidth, settingNodeColor, setSettingNodeColor,
            settingNodePopulationPerColor, setSettingNodePopulationPerColor, settingNodeXVariableColor, setSettingNodeXVariableColor,
            settingNodeTitleFontSize, setSettingNodeTitleFontSize, settingNodeTitleFontColor, setSettingNodeTitleFontColor,
            settingNodePopulationPerFontSize, setSettingNodePopulationPerFontSize, settingNodePopulationPerFontColor, setSettingNodePopulationPerFontColor,
            settingNodeXVariableFontSize, setSettingNodeXVariableFontSize, settingNodeXVariableFontColor, setSettingNodeXVariableFontColor,
            settingNodeContentFontSize, setSettingNodeContentFontSize, settingNodeContentFontColor, setSettingNodeContentFontColor,
            settingPrecisionContent, setsettingPrecisionContent, settingPrecisionPopulation, setsettingPrecisionPopulation,
            settingTreeLineThickness, setSettingTreeLineThickness, settingTreeLineColor, setSettingTreeLineColor, settingTreeXDifference, setSettingTreeXDifference,
            settingTreeYDifference, setSettingTreeYDifference, settingDistBetTwoSibNodeGroup, setSettingDistBetTwoSibNodeGroup,
            settingBackgroundColor, setSettingBackgroundColor, settingZoomIntensity, setSettingZoomIntensity,
            settingNodeColorOpacity, setSettingNodeColorOpacity, settingNodePopulationPerColorOpacity, setSettingNodePopulationPerColorOpacity,
            settingNodeXVariableColorOpacity, setSettingNodeXVariableColorOpacity, settingNodeTitleFontColorOpacity, setSettingNodeTitleFontColorOpacity,
            settingNodePopulationPerFontColorOpacity, setSettingNodePopulationPerFontColorOpacity, settingNodeXVariableFontColorOpacity, setSettingNodeXVariableFontColorOpacity,
            settingNodeContentFontColorOpacity, setSettingNodeContentFontColorOpacity, settingTreeLineColorOpacity, setSettingTreeLineColorOpacity,
            settingBackgroundColorOpacity, setSettingBackgroundColorOpacity, xVarNodes, setXVarNodes, lines, setLines, 
            
            settingAssistantContainerDisplay, setSettingAssistantContainerDisplay,
            settingPCLassDisplay, setSettingPCLassDisplay,
            settingZScoreDisplay, setSettingZScoreDisplay,
            settingChiSquareDisplay, setSettingChiSquareDisplay,
            settingRSquareDisplay, setSettingRSquareDisplay,
            settingAdjustedRSquareDisplay, setSettingAdjustedRSquareDisplay,
            settingGiniDisplay, setSettingGiniDisplay,

            stageRef, handleExport, 

            handTool, setHandTool, graphicTool, setGraphicTool,
            tool, setTool, 

            stageTree, setStageTree,
            reservedStageData, setReservedStageData,

            detectMob,

            instance, setInstance,
            instanceNames, setInstanceNames,

            reloader
        }}>
            {children}
        </Data.Provider>
    )
}

const DataState = () => {
    return useContext(Data)
}

export default DataContext
export { DataState }