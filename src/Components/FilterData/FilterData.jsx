import { useState } from "react"
import { Button, Modal, Badge, ListGroup } from 'react-bootstrap'
import { DataState } from "../../Context/Context"
import { uriGraphs } from "../../backendURLs"
import LineBarChart from '../D3/BarChart'
import axios from "axios"

export default function FilterData({ showYVarSelectModal, handleCloseYVarSelectModal, modalVariables }) {

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

    return (
        <>
            <Modal
                show={showYVarSelectModal}
                onHide={handleCloseYVarSelectModal}
                size="xl"
            >
                <Modal.Header>
                    <Modal.Title>Filter Data for this instance</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex">

                    <div className="w-75">
                        <ListGroup as="ol" numbered>

                            {
                                (showYVarSelectModal) &&
                                modalVariables.map((v) => (
                                    <div key={v.variablename}
                                        onClick={() => { }}
                                        onMouseOver={() => {
                                            getGraphData(v.variablename)
                                        }}
                                        onDoubleClick={() => {
                                        }
                                        }
                                        as="li"
                                        className="d-flex justify-content-between align-items-start my-1"
                                    >
                                        <div class="form-check">
                                            <input type="checkbox" class="form-check-input" id="exampleCheck1" defaultChecked={true}/>
                                        </div>
                                        <div className="ms-2 me-auto">
                                            <div className="fw-bold">{v.variablename}</div>
                                        </div>
                                        <Badge>
                                            {v.variablecardinality}
                                        </Badge>
                                    </div>
                                ))
                            }

                        </ListGroup>
                    </div>
                    <div className="w-100 d-flex align-items-center">
                        <LineBarChart data={barData} />
                    </div>

                </Modal.Body>
                <Modal.Footer>

                    <Button onClick={handleCloseYVarSelectModal}
                        className="btn btn-success float-right"
                    >
                        Save Filters
                    </Button>

                    <Button onClick={handleCloseYVarSelectModal}
                        className="btn btn-primary float-right"
                    >
                        Close
                    </Button>

                </Modal.Footer>
            </Modal>
        </>
    )
}
