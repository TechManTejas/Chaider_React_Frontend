import './customContextMenu.css';

export default function TrendsMenu({ showTrendstMenu, anchorPoint, showTrends}) {
    return (
        <>
            {showTrendstMenu ? (
                <ul
                    className="menu"
                    style={{
                        top: anchorPoint.y,
                        left: anchorPoint.x
                    }}
                >
                    <li><button className="menuBtn" onClick={(e)=>showTrends(e)} >Show Trends</button></li>
                </ul>
            ) : (
                <> </>
            )}
        </>
    );
}   