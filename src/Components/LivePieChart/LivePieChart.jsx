import PieSVG from "../D3/PieSVG";
import "./LivePieChart.css"

export default function LivePieChart({ height, width, D3Data, detailsData, opacityAssistantContainer, settingPrecisionContent }) {
    return (
        <>
            <div
                className="floatingContainerPieChart"
                style={{
                    position: "absolute",
                    bottom: height * 0.01,
                    left: width * 0.005,
                    opacity: opacityAssistantContainer
                }}
            >
                <div style={{
                    padding: "5px"
                }}>
                    <PieSVG
                        data={D3Data}
                        width={180}
                        height={180}
                        innerRadius={20}
                        outerRadius={90}
                    />
                </div>


                <div className="d-flex justify-content-center"
                    style={{
                        background: "#28282B",
                        color: "white",
                        maxHeight: "120px",
                        overflowY: "auto"
                    }}>
                    <div className="d-flex flex-column">
                        {
                            D3Data.map((dv) => {
                                return (
                                    <div className="d-flex">
                                        <div style={{ fontSize: 16, color: "#00E0FE" }}>
                                            {dv.data}
                                        </div>
                                        <div style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                                            :
                                        </div>
                                        <div style={{ fontSize: 16, color: "#ffffff", paddingRight: "5px" }}>
                                            {dv.value}
                                        </div>
                                        <div style={{ fontSize: 16, color: "#51ff0d" }}>
                                            ({((dv.value / detailsData.total) * 100).toPrecision(settingPrecisionContent)}%)
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

            </div>
        </>

    );
}

