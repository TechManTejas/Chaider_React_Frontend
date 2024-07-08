import { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import LineBarChart from '../D3/LineBarChart'

export default function ModalTrends({ showDetails, handleCloseDetails, detailsData, trendNodes }) {

    const [barData, setBarData] = useState([
        { year: 'female', sales: 843, efficiency: 11.2},
        { year: 'male', sales: 466, efficiency: 10.2 }
    ])

    useEffect(() => {
        var newData = []
        trendNodes.forEach((node, i) => {
            newData.push({
                ptotal: detailsData.total,
                year: node.nodeName,
                sales: node.total,
                efficiency: (node.values[1][1]/node.total) * 100,
                sales2: node.total-node.values[1][1]
            })
            console.log(node.values[1][1])
        })
        setBarData(newData)
    }, [trendNodes])

    return (
        <>
            <Modal
                show={showDetails}
                onHide={handleCloseDetails}
                size="xl"
            >
                <Modal.Header>
                    <Modal.Title>{detailsData.childrenCategory}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex">
                    <div style={{ height: '60vh' }}>
                        <div className="d-flex justify-content-center align-items-center">
                        </div>
                    </div>

                    <div className="w-100 d-flex align-items-center">
                        <LineBarChart data={barData} />
                    </div>
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