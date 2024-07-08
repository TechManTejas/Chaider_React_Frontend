import { Form } from 'react-bootstrap'

export default function Pen({ tool, handTool, penColor, setPenColor, pen_eraser_Size, setPenEraserSize }) {
    return (
        <>
            {((tool == "pen") && (handTool == "crosshair")) && <div
                className="floatingContainer"
                style={{
                    top: window.innerHeight/2,
                    right: window.innerWidth * 0.005,
                    opacity: 1
                }}
            >
                <div className="d-flex flex-column justify-content-center">

                    <div className="h5 d-flex justify-content-center">
                        PEN
                    </div>

                    <div className="d-flex flex-column justify-content-between container">

                        <div className="d-flex justify-content-center">
                            <Form.Label htmlFor="nodeColorPicker">
                                <div className="h6">
                                    Color
                                </div>
                            </Form.Label>
                        </div>

                        <div className="d-flex justify-content-center">
                            <Form.Control
                                type="color"
                                defaultValue={penColor}
                                id="nodeColorPicker"
                                onChange={(e) => { setPenColor(e.target.value) }}
                                title="Choose your color"
                            />
                        </div>

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
    );
}