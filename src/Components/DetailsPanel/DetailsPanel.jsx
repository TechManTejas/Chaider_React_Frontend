import { Button, Modal, ListGroup } from 'react-bootstrap'
import PieSVG from "../D3/PieSVG";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import toast, { Toaster } from 'react-hot-toast';
import logger from '../../Log/logger'

export default function ModalDetailsPanel({ showDetails, handleCloseDetails, detailsData, D3Data, DATA }) {

    const notify = () => {
        toast.success(`${detailsData.nodeName} copied to clipboard`)
        logger.info(JSON.stringify(detailsData.nodeName) + " copied to clipboard")
    };

    return (
        <>
            <Modal
                show={showDetails}
                onHide={handleCloseDetails}
                size="lg"
            >
                <Modal.Header>
                    <Modal.Title>{detailsData.nodeName} ({detailsData.total})</Modal.Title>
                </Modal.Header>
                <Modal.Body >

                    <>
                        <div className="d-flex">

                            <div>
                                <div style={{ backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "10%" }}>
                                    <PieSVG
                                        data={D3Data}
                                        width={300}
                                        height={300}
                                        innerRadius={40}
                                        outerRadius={150}
                                    />
                                </div>
                                <div className="d-flex justify-content-center">
                                    <div>
                                        {
                                            D3Data.map((dv) => {
                                                return (
                                                    <div className="d-flex">
                                                        <div style={{ fontSize: 24, fontWeight: "bold", color: "#000000" }}>
                                                            {dv.data}
                                                        </div>
                                                        <div style={{ fontSize: 24, fontWeight: "bold", paddingLeft: "5px", paddingRight: "5px" }}>
                                                            :
                                                        </div>
                                                        <div style={{ fontSize: 24, fontWeight: "bold", color: "#000000", paddingRight: "5px" }}>
                                                            {dv.value}
                                                        </div>
                                                        <div style={{ fontSize: 24, fontWeight: "bold", color: "#000000" }}>
                                                            ({((dv.value / detailsData.total) * 100).toPrecision(5)}%)
                                                        </div>

                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>

                            </div>

                            <div style={{ width: "100%" }}>
                                {(Array.isArray(DATA)) && DATA.length > 1 &&
                                    <>
                                        <div style={{ width: "100%" }}>
                                            <div className="d-flex justify-content-center">
                                                <div>
                                                    <Button variant="primary" style={{ borderRadius: "50%" }} onClick={() => {
                                                        navigator.clipboard.writeText(JSON.stringify(DATA))
                                                        notify()
                                                    }}>
                                                        <FontAwesomeIcon icon={faCopy} />
                                                    </Button>
                                                    <Toaster />
                                                </div>
                                                <div className='m-1' style={{ fontSize: 18 }}>
                                                    Copy list to clipboard
                                                </div>
                                            </div>


                                            <div style={{ padding: "10px" }}>

                                                <ListGroup style={{ overflowY: "scroll", height: "320px", boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 1px, rgb(51, 51, 51) 0px 0px 0px 1px" }}>
                                                    {
                                                        DATA.map((data) => {
                                                            return (
                                                                <>
                                                                    <ListGroup.Item>{data}</ListGroup.Item>
                                                                </>

                                                            )
                                                        })
                                                    }
                                                </ListGroup>

                                            </div>

                                        </div>
                                    </>
                                }
                            </div>

                        </div>

                    </>

                </Modal.Body>
                <Modal.Footer>
                    {
                        <Button onClick={() => {
                            handleCloseDetails()
                        }}
                            className="btn btn-primary float-right"
                        >
                            Close
                        </Button>
                    }
                </Modal.Footer>
            </Modal>

        </>
    )
}