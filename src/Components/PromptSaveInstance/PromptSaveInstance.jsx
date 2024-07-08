import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function PromptSaveInstance({ showPrompt, handleClosePrompt, afterFunction, saveFunction }) {
    return (
        <Modal
            show={showPrompt}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Save This Instance?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Do you want to save this instance before leaving?
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button className='btn btn-success w-25' onClick={() => { saveFunction(); handleClosePrompt();afterFunction()}}>Yes</Button>
                <Button className='btn btn-danger w-25' onClick={()=>{ handleClosePrompt();afterFunction()}}>No</Button>
            </Modal.Footer>
        </Modal>
    );
}

