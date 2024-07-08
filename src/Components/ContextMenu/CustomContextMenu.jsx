import './customContextMenu.css';

export default function CustomContextMenu({ showContextMenu, anchorPoint, forceSplit, findSplit, nextSplit, prevSplit, treeGrow, deleteSubnodes }) {
    return (
        <>
            {showContextMenu ? (
                <ul
                    className="menu"
                    style={{
                        top: anchorPoint.y,
                        left: anchorPoint.x
                    }}
                >
                    <li><button className="menuBtn" onClick={forceSplit}>Force Split</button></li>
                    <li><button className="menuBtn" onClick={findSplit}>Find Split</button></li>
                    <li><button className="menuBtn" onClick={nextSplit}>Next Split</button></li>
                    <li><button className="menuBtn" onClick={prevSplit}>Prev Split</button></li>
                    <li><button className="menuBtn" onClick={treeGrow}>Tree Grow</button></li>
                    <li><button className="menuBtn" onClick={deleteSubnodes}>Delete Subnodes</button></li>
                </ul>
            ) : (
                <> </>
            )}
        </>
    );
}   