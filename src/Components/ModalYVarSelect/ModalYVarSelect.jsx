import { useState } from "react"
import { Button, Modal, Badge, ListGroup } from 'react-bootstrap'
import { DataState } from "../../Context/Context"
import { uriGraphs } from "../../backendURLs"
import LineBarChart from '../D3/BarChart'
import axios from "axios"

export default function ModalYVarSelect({ showYVarSelectModal, handleCloseYVarSelectModal, selectedVar, modalVariables, onYVarSelect, notifyAsyncStatusYVariable }) {

    const { id } = DataState();
    const [barData, setBarData] = useState([{ year: 1, sales: 843 },
    { year: 2, sales: 466 }])

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

    return (
        <>
            <Modal
                show={showYVarSelectModal}
                onHide={handleCloseYVarSelectModal}
                backdrop="static"
                keyboard={false}
                size="xl"
            >
                <Modal.Header>
                    <Modal.Title>Select Y Variable ({selectedVar})</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex">

                    <div className="w-75">
                        <ListGroup as="ol" numbered>

                            {
                                (showYVarSelectModal) &&
                                modalVariables.map((v) => (
                                    <Button key={v.variablename}
                                        onClick={() => onYVarSelect(v.variablename)}
                                        onMouseOver={() => {
                                            getGraphData(v.variablename)
                                        }}
                                        onDoubleClick={() => {
                                            onYVarSelect(v.variablename)
                                            handleCloseYVarSelectModal()
                                            notifyAsyncStatusYVariable()
                                        }
                                        }
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
                        <Button
                            onClick={(e) => {
                                handleCloseYVarSelectModal()
                                notifyAsyncStatusYVariable()
                            }}>
                            Start Analysis
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </>
    )
}
