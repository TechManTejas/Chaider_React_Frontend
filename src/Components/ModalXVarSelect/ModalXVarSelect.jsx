import { useState } from "react"
import { Button, Modal, Badge, ListGroup } from 'react-bootstrap'
import { DataState } from "../../Context/Context"
import { uriGraphs } from "../../backendURLs"
import LineBarChart from '../../Components/D3/BarChart'
import axios from "axios"

export default function ModalXVarSelect({ mappingData, showVariables, handleCloseVariables, selectedXVar, onVarSelect, selectedVar, onXVarConfirmed: onXVarConfirmed }) {

    const { id } = DataState();
    const [barData, setBarData] = useState([{ male: 843 }, { female: 466 }])

    const getGraphData = async (variable) => {

        setBarData([])

        var postData = {
            "csvid": id,
            "variable": variable
        }

        const url = uriGraphs

        const response = axios.post(url, postData,
            {
                headers: {
                    'Authorization': `Token ${localStorage.getItem("AccessToken")}`
                },
            }).then(({ data }) => {
                var newData = [];
                for (let key in data) {
                    newData.push({ year: key, sales: data[key] })
                }
                console.log(newData)
                setBarData(newData)
            });
    }

    var data = [
        { year: 1, sales: 323 },
        { year: 2.5, sales: 277 },
        { year: 3, sales: 709 }
    ]

    return (
        <>
            <Modal
                show={showVariables}
                onHide={handleCloseVariables}
                keyboard={false}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Select X Variable({selectedXVar})</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex">

                    <div className="w-75">
                        <ListGroup as="ol" numbered>

                            {
                                (showVariables) &&
                                mappingData.map((v) => (
                                    <Button key={v.variablename}
                                        onClick={() => onVarSelect(v.variablename, v.variablecardinality)}
                                        onMouseOver={() => {
                                            getGraphData(v.variablename)
                                        }}
                                        onDoubleClick={() => {
                                            onVarSelect(v.variablename, v.variablecardinality)
                                            onXVarConfirmed();
                                            handleCloseVariables()
                                        }}
                                        as="li"
                                        className="d-flex justify-content-between align-items-start"
                                    >
                                        <div className="ms-2 me-auto">
                                            <div className="fw-bold">{v.variablename}</div>
                                        </div>
                                        <Badge>
                                            {v.variablecardinality}
                                        </Badge>
                                    </Button>
                                ))
                            }

                        </ListGroup>
                    </div>
                    <div className="w-100 d-flex align-items-center">
                        <LineBarChart data={barData} />
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    {
                        (selectedVar !== "") &&
                        <Button onClick={() => {
                            onXVarConfirmed();
                            handleCloseVariables()
                        }}
                            className="btn btn-primary float-right"
                        >
                            Start Analysis
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </>
    )
}
