import ICardGridService from '../interfaces/ICardGridService'

export default class CardGridService extends ICardGridService {
  constructor() {
    super()
  }

  calculateVisibleRange(params) {
    const {
      scrollTop,
      containerHeight,
      containerWidth,
      totalItems,
      itemHeight,
      itemWidth,
      bufferSize
    } = params

    const columnsPerRow = Math.max(1, Math.floor(containerWidth / itemWidth))
    const totalRows = Math.ceil(totalItems / columnsPerRow)

    // Calculate visible rows
    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    )

    // Calculate visible items
    const startIndex = startRow * columnsPerRow
    const endIndex = Math.min(endRow * columnsPerRow, totalItems)

    return {
      startIndex,
      endIndex,
      startRow,
      endRow,
      columnsPerRow,
      totalRows
    }
  }

  calculateGridLayout(params) {
    const { containerWidth, itemWidth, gap } = params

    const columnsPerRow = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)))
    const totalWidth = columnsPerRow * (itemWidth + gap) - gap

    return {
      columnsPerRow,
      totalWidth,
      columnWidth: itemWidth,
      gap
    }
  }

  calculateItemPosition(params) {
    const {
      index,
      columnsPerRow,
      itemHeight,
      itemWidth,
      gap
    } = params

    const row = Math.floor(index / columnsPerRow)
    const column = index % columnsPerRow

    return {
      top: row * (itemHeight + gap),
      left: column * (itemWidth + gap)
    }
  }

  calculateTotalHeight(params) {
    const {
      totalItems,
      columnsPerRow,
      itemHeight,
      gap
    } = params

    const totalRows = Math.ceil(totalItems / columnsPerRow)
    return totalRows * (itemHeight + gap) - gap
  }
}
