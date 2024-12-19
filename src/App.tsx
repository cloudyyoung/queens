import clsx from "clsx"
import { useState } from "react"
import _ from "lodash"

import { Button } from "./components/button"

export const App = () => {
  const [slots, setSlots] = useState<Slot[]>(generateSlots())
  const [satisfied, setSatisfied] = useState(false)

  const onClick = (slot: Slot) => {
    const { index, isQueen: isQueenOld } = slot
    const isQueen = !isQueenOld

    slots[index].isQueen = isQueen
    toggleCrossed(slots, index, isQueen)

    for (let i = 0; i < 100; i++) {
      if (slots[i].isQueen) {
        toggleCrossed(slots, i, true)
      }
    }

    const satisfied = checkQueensSlots(slots)
    setSatisfied(satisfied)

    setSlots([...slots])
  }

  const onClear = () => {
    setSlots(slots.map((slot) => ({ ...slot, isQueen: false, isCrossed: false, isConflicted: false })))
    setSatisfied(false)
  }

  const onNewGame = () => {
    setSlots(generateSlots())
    setSatisfied(false)
  }

  return (
    <>
      <div className="max-w-2xl mx-auto flex justify-center items-center h-screen text-zinc-950 dark:text-white p-6">
        <div className="h-fit w-full rounded-xl bg-white shadow-[0px_0px_0px_1px_rgba(9,9,11,0.07),0px_2px_2px_0px_rgba(9,9,11,0.05)] dark:bg-zinc-900 dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.1)] dark:before:pointer-events-none dark:before:absolute dark:before:-inset-px dark:before:rounded-xl dark:before:shadow-[0px_2px_8px_0px_rgba(0,_0,_0,_0.20),_0px_1px_0px_0px_rgba(255,_255,_255,_0.06)_inset] forced-colors:outline">
          <div className="space-y-6 p-6">
            <div className="text-2xl text-center">Queens</div>

            <div className="grid grid-cols-10 gap-0 border-2 border-zinc-950">
              {
                slots.map((slot) => (
                  <Slot {...slot} onClick={() => onClick(slot)} key={slot.index} disabled={satisfied} />
                ))
              }
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={onClear} disabled={satisfied}>Clear</Button>
              <Button onClick={onNewGame}>New game</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App

export interface Slot {
  index: number
  isQueen: boolean
  isCrossed: boolean
  isConflicted: boolean
  region: number
}

export interface SlotProps extends Slot {
  disabled?: boolean
  onClick: () => void
}

export const Slot = ({ isQueen, isCrossed, isConflicted, region, disabled, onClick }: SlotProps) => {
  let icon = null

  if (isQueen) {
    icon = 'crown'
  } else if (isCrossed) {
    icon = 'close'
  }

  const bgColor = REGION_COLORS[region - 1]

  return (
    <div
      className={clsx(
        "aspect-square border-solid border-zinc-600 border-[0.5px] flex justify-center items-center cursor-pointer",
        bgColor,
        disabled && 'pointer-events-none',
      )}
      onClick={onClick}
    >
      <span className={clsx(
        'material-symbols-sharp',
        (!isQueen && isCrossed) && 'text-zinc-600',
        (isQueen && isCrossed) && 'text-red-600',
        (isQueen && isConflicted) && 'text-red-600',
      )}>
        {icon}
      </span>
    </div>
  )
}

const REGION_COLORS = [
  "bg-zinc-50",
  "bg-red-100",
  "bg-orange-100",
  "bg-amber-100",
  // "bg-yellow-100",
  "bg-lime-100",
  // "bg-green-100",
  "bg-emerald-100",
  "bg-teal-100",
  "bg-cyan-100",
  "bg-sky-100",
  // "bg-blue-100",
  "bg-indigo-100",
  "bg-violet-100",
  // "bg-purple-100",
  "bg-fuchsia-100",
  "bg-pink-100",
  "bg-rose-100",
]

const toggleCrossed = (slots: Slot[], index: number, isCrossed: boolean) => {
  // Cross out the row
  const sameRowIndices = getSameRowIndices(index)
  sameRowIndices.forEach((sameRowIndex) => {
    if (sameRowIndex === index) return
    slots[sameRowIndex].isCrossed = isCrossed
  })

  // Cross out the column
  const sameColumnIndices = getSameColumnIndices(index)
  sameColumnIndices.forEach((sameColumnIndex) => {
    if (sameColumnIndex === index) return
    slots[sameColumnIndex].isCrossed = isCrossed
  })

  // Cross out the touching slots
  const touchingIndices = getTouchingIndices(index)
  touchingIndices.forEach((touchingIndex) => {
    if (touchingIndex === index) return
    slots[touchingIndex].isCrossed = isCrossed
  })
}

const generateSlots = () => {
  const slots: Slot[] = Array.from({ length: 100 }, (_, i) => ({ index: i, isQueen: false, isCrossed: false, isConflicted: false, region: 0 }))
  const queens = []

  let indices = Array.from({ length: 100 }, (_, i) => i)
  while (indices.length > 0) {
    const { queen, remainingIndices } = pickQueenSlot(indices)
    queens.push(queen)
    indices = remainingIndices
  }

  queens.forEach((queen, i) => {
    // slots[queen].isQueen = true
    slots[queen].region = i + 2
  })

  let unregionedSlots = slots.filter((slot) => slot.region === 0)
  while (unregionedSlots.length > 0) {
    const slot = _.sample(unregionedSlots) as Slot
    const touchingIndices = getFourDirectionsIndices(slot.index)
    const regions = touchingIndices.map((touchingIndex) => slots[touchingIndex].region).filter((region) => region > 0)

    if (regions.length === 0) continue

    const region = _.max(regions) as number
    slot.region = region
    const remainingSlots = _.difference(unregionedSlots, [slot])
    unregionedSlots = remainingSlots
  }

  return slots
}

const pickQueenSlot = (indices: number[]) => {
  if (indices.length === 0) throw new Error('No indices provided to pick queen')

  const queen = _.sample(indices) as number
  const touchingIndices = getTouchingIndices(queen)
  const sameRowIndices = getSameRowIndices(queen)
  const sameColumnIndices = getSameColumnIndices(queen)
  const remainingIndices = _.difference(indices, touchingIndices, sameRowIndices, sameColumnIndices)
  return { queen, remainingIndices }
}

const checkQueensSlots = (slots: Slot[]) => {
  const regionsQueens = _.groupBy(slots.filter((slot) => slot.isQueen), 'region')
  for (const region in regionsQueens) {
    regionsQueens[region].forEach((slot) => {
      slot.isConflicted = regionsQueens[region].length > 1
    })
  }

  const regions = _.groupBy(slots, 'region')
  const numberOfRegions = Object.keys(regions).length
  const numberOfAllocatedRegions = Object.keys(regionsQueens).length

  const satisfied = Object.values(regionsQueens).every((queens) => queens.length === 1)
    && numberOfRegions === numberOfAllocatedRegions
  return satisfied
}

const getSameRowIndices = (a: number) => {
  const row = Math.floor(a / 10)
  return Array.from({ length: 10 }, (_, i) => row * 10 + i)
}

const getSameColumnIndices = (a: number) => {
  const column = a % 10
  return Array.from({ length: 10 }, (_, i) => i * 10 + column)
}

const getTouchingIndices = (a: number) => {
  const previousRow = Math.floor(a / 10) - 1
  const currentRow = Math.floor(a / 10)
  const nextRow = Math.floor(a / 10) + 1

  const previousRowIndices = [a - 9, a - 10, a - 11].filter((index) => _.inRange(index, previousRow * 10, (previousRow + 1) * 10))
  const currentRowIndices = [a - 1, a, a + 1].filter((index) => _.inRange(index, currentRow * 10, (currentRow + 1) * 10))
  const nextRowIndices = [a + 9, a + 10, a + 11].filter((index) => _.inRange(index, nextRow * 10, (nextRow + 1) * 10))

  const touchingIndices = [
    ...previousRowIndices,
    ...currentRowIndices,
    ...nextRowIndices,
  ].filter((index) => index >= 0 && index < 100)

  return touchingIndices
}

const getFourDirectionsIndices = (a: number) => {
  const previousRow = Math.floor(a / 10) - 1
  const currentRow = Math.floor(a / 10)
  const nextRow = Math.floor(a / 10) + 1

  const previousRowIndices = [a - 10].filter((index) => _.inRange(index, previousRow * 10, (previousRow + 1) * 10))
  const currentRowIndices = [a - 1, a, a + 1].filter((index) => _.inRange(index, currentRow * 10, (currentRow + 1) * 10))
  const nextRowIndices = [a + 10].filter((index) => _.inRange(index, nextRow * 10, (nextRow + 1) * 10))

  const touchingIndices = [
    ...previousRowIndices,
    ...currentRowIndices,
    ...nextRowIndices,
  ].filter((index) => index >= 0 && index < 100)

  return touchingIndices
}