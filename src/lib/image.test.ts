import { describe, expect, it } from 'vitest'
import { squareCrop } from './image'

describe('squareCrop', () => {
  it('keeps the middle of a tall picture', () => {
    expect(squareCrop(1150, 1304)).toEqual({ x: 0, y: 77, size: 1150 })
  })

  it('keeps the middle of a wide picture', () => {
    expect(squareCrop(1600, 900)).toEqual({ x: 350, y: 0, size: 900 })
  })

  it('leaves a square untouched', () => {
    expect(squareCrop(500, 500)).toEqual({ x: 0, y: 0, size: 500 })
  })
})
