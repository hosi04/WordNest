import { describe, expect, it } from 'vitest'
import { parseCsv, wordsFromCsv } from './csv'

describe('parseCsv', () => {
  it('handles quotes, escaped quotes, commas and newlines in fields', () => {
    const text = 'a,b\r\n"x, y","say ""hi""\nthere"\n\n'
    expect(parseCsv(text)).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"\nthere'],
    ])
  })

  it('strips a BOM and keeps a last line without newline', () => {
    expect(parseCsv('﻿a,b\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })
})

describe('wordsFromCsv', () => {
  const header = 'word,meaning_vi,part_of_speech,level,example_en,example_vi'

  it('maps the spec columns to words', () => {
    const { words, errors } = wordsFromCsv(
      `${header}\nresilient,"kiên cường, mau phục hồi",adjective,b2,Kids are resilient.,Trẻ con rất kiên cường.`,
    )
    expect(errors).toEqual([])
    expect(words).toEqual([
      {
        word: 'resilient',
        meaning_vi: 'kiên cường, mau phục hồi',
        part_of_speech: 'adjective',
        level: 'B2',
        ipa: null,
        definition_en: null,
        examples: [{ en: 'Kids are resilient.', vi: 'Trẻ con rất kiên cường.' }],
        synonyms: [],
      },
    ])
  })

  it('accepts columns in any order and optional columns missing', () => {
    const { words } = wordsFromCsv('meaning_vi,word\nbột mì,flour')
    expect(words[0]).toMatchObject({ word: 'flour', meaning_vi: 'bột mì', level: null, examples: [] })
  })

  it('reports missing required columns', () => {
    expect(wordsFromCsv('word,level\nflour,A2').errors).toEqual([{ kind: 'missingColumns', columns: ['meaning_vi'] }])
  })

  it('skips incomplete and duplicate rows, blanks invalid levels', () => {
    const { words, errors } = wordsFromCsv(`${header}\nflour,bột mì,,Z9\n,thiếu từ\nFlour,trùng`)
    expect(words).toHaveLength(1)
    expect(words[0].level).toBeNull()
    expect(errors).toEqual([
      { kind: 'badLevel', line: 2, level: 'Z9' },
      { kind: 'missingFields', line: 3 },
      { kind: 'duplicate', line: 4, word: 'Flour' },
    ])
  })
})
