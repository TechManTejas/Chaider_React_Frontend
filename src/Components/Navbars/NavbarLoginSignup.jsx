import { Navbar, Nav, Image, Container } from 'react-bootstrap';

function TopNavigationBar() {
    return (
        <Navbar bg="dark" variant="dark">
            <Container>

                <Nav className="me-1">
                    <span>
                        <Image src="logo761.png" width="40" />
                    </span>
                </Nav>

                <Navbar.Brand href="Dashboard">CHAIDER</Navbar.Brand>
                <Navbar.Collapse id="responsive-navbar-nav"/>
            </Container>
        </Navbar>
    );
}

export default TopNavigationBar;