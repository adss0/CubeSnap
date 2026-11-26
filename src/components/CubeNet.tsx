import {
  COLOR_HEX,
  COLOR_LETTER,
  FACES,
  FACE_NAME,
  STICKERS_PER_FACE,
  isCenterIndex,
  type CubeColors,
  type Face,
} from '../cube/colors'

/** Where each face sits in the unfolded cross, as [column, row] in a 4x3 grid. */
const NET_POSITION: Record<Face, [number, number]> = {
  U: [2, 1],
  L: [1, 2],
  F: [2, 2],
  R: [3, 2],
  B: [4, 2],
  D: [2, 3],
}

type CubeNetProps = {
  colors: CubeColors
  onStickerClick?: (index: number) => void
  highlightFace?: Face
}

export const CubeNet = ({ colors, onStickerClick, highlightFace }: CubeNetProps) => (
  <div className="cube-net" role="group" aria-label="Unfolded cube">
    {FACES.map((face, faceIndex) => {
      const [column, row] = NET_POSITION[face]
      const offset = faceIndex * STICKERS_PER_FACE
      const isHighlighted = face === highlightFace
      return (
        <div
          key={face}
          className={isHighlighted ? 'net-face net-face--highlight' : 'net-face'}
          style={{ gridColumn: column, gridRow: row }}
          aria-label={`${FACE_NAME[face]} face`}
        >
          {Array.from({ length: STICKERS_PER_FACE }, (_, i) => {
            const index = offset + i
            const color = colors[index]
            const editable = onStickerClick !== undefined && !isCenterIndex(index)
            return (
              <button
                key={index}
                type="button"
                className="sticker"
                style={{ background: COLOR_HEX[color] }}
                disabled={!editable}
                onClick={editable ? () => onStickerClick(index) : undefined}
                aria-label={`${FACE_NAME[face]} sticker ${i + 1}: ${color}`}
              >
                <span className="sticker-letter">{COLOR_LETTER[color]}</span>
              </button>
            )
          })}
        </div>
      )
    })}
  </div>
)
