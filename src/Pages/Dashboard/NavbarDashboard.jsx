import { Navbar, Image, Modal, Container, Button } from 'react-bootstrap';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState, } from "react";
import { useNavigate } from "react-router-dom";
import ReactTooltip from 'react-tooltip';
import logger from '../../Log/logger'

function TopNavigationBar() {

    const navigate = useNavigate();

    const [showLogout, setShowLogout] = useState(false);
    const handleCloseLogout = () => setShowLogout(false);
    const handleShowLogout = () => setShowLogout(true);

    const logout = () => {
        logger.info("Logging out")
        localStorage.clear();
        logger.info("Cleared localStorage")
        logger.info("Navigating to /")
        navigate("/");
    }

    return (
        <>
            <>
                <ReactTooltip id="tip_logout" effect="solid" delayShow={1000}>
                    Logout
                </ReactTooltip>
            </>
            <>
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Container>

                        <div className="me-1">
                            <span>
                                <Image src="logo761.png" width="40" />
                            </span>
                        </div>

                        <Navbar.Brand href="Dashboard">CHAIDER DASHBOARD</Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <>
                                <div className="me-auto">
                                </div>

                                <div className="me-1">
                                    <Button variant="dark " onClick={handleShowLogout} data-tip data-for="tip_logout">
                                        <FontAwesomeIcon icon={faDoorOpen} />
                                    </Button>
                                </div>
                            </>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <>
                    <Modal show={showLogout} onHide={handleCloseLogout}>
                        <Modal.Header closeButton>
                            <Modal.Title>Logout</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Do you want to log out?</Modal.Body>
                        <Modal.Footer>
                            <Button onClick={logout}>
                                LOGOUT
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            </>

        </>
    );
}

export default TopNavigationBar;