import { COLORS, COLOR_HEX, STICKERS_PER_FACE, type Color, type CubeColors } from '../cube/colors'

type ColorPaletteProps = {
  colors: CubeColors
  selected: Color
  onSelect: (color: Color) => void
}

export const ColorPalette = ({ colors, selected, onSelect }: ColorPaletteProps) => (
  <div className="palette" role="radiogroup" aria-label="Sticker colour">
    {COLORS.map((color) => {
      const count = colors.filter((c) => c === color).length
      const isOff = count !== STICKERS_PER_FACE
      return (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={color === selected}
          className={color === selected ? 'swatch swatch--selected' : 'swatch'}
          onClick={() => onSelect(color)}
        >
          <span className="swatch-chip" style={{ background: COLOR_HEX[color] }} />
          <span className="swatch-name">{color}</span>
          <span className={isOff ? 'swatch-count swatch-count--off' : 'swatch-count'}>
            {count}/9
          </span>
        </button>
      )
    })}
  </div>
)
