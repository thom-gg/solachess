import styles from '../styles/Home.module.css';


interface Props {
    image?: string
    number: number,
    boardWidth: number,
    isLastMove: boolean

}


export default function Tile({ number, image, boardWidth, isLastMove }: Props) {
    let color = "";
    if (number % 2 == 0) {
        color = "rgb(186, 159, 251,";
    }
    else {
        color = "rgb(253, 240, 213,"
    }

    if (isLastMove) {

        color += "0.5)";
    }
    else {
        color += "1)";
    }


    return (
        <div className={styles.tile} style={{
            width: `${boardWidth / 8}px`, height: `${boardWidth / 8}px`,
            backgroundColor: color, display: "grid",
            placeContent: "center",
        }}>
            {image && <div className="chessPiece" style={{
                backgroundImage: `url(${image})`, width: `${boardWidth / 8}px`, height: `${boardWidth / 8}px`, backgroundRepeat: "no-repeat", backgroundPosition: "center",
                backgroundSize: `${boardWidth / 10}px`,
            }}></div>}
            {/* <p style={{ color: "black" }}>{number}</p> */}
        </div>);
}