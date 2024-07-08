import { Form } from 'react-bootstrap'

export default function Eraser({ tool, handTool, pen_eraser_Size, setPenEraserSize }) {
    return (
        <>
            {((tool == "eraser") && (handTool == "crosshair")) && <div
                className="floatingContainer"
                style={{
                    top: window.innerHeight/2,
                    right: window.innerWidth * 0.005,
                    opacity: 1
                }}
            >
                <div className="d-flex flex-column justify-content-center">

                    <div className="h5 d-flex justify-content-center">
                        ERASER
                    </div>

                    <div className="d-flex flex-column justify-content-between container">

                        <div>
                            <Form.Label>
                                <div className="h6">
                                    Size:
                                </div>
                            </Form.Label>
                            <Form.Range defaultValue={pen_eraser_Size} onChange={(e) => { setPenEraserSize(e.target.value) }} />
                        </div>

                    </div>

                </div>
            </div>
            }
        </>
    )
}
