import { describe, expect, it } from 'vitest'
import { parseEntries } from './dictionary'

describe('parseEntries', () => {
  it('returns null for an empty response', () => {
    expect(parseEntries([])).toBeNull()
  })

  it('picks IPA, first meaning and the first available example', () => {
    const result = parseEntries([
      {
        phonetics: [{}, { text: '/məˈtɪk.jə.ləs/' }],
        meanings: [
          {
            partOfSpeech: 'adjective',
            definitions: [
              { definition: 'Showing great attention to detail.' },
              { definition: 'Very careful.', example: 'She kept meticulous records.' },
            ],
            synonyms: ['careful', 'thorough'],
          },
        ],
      },
    ])

    expect(result).toEqual({
      ipa: '/məˈtɪk.jə.ləs/',
      partOfSpeech: 'adjective',
      definition: 'Showing great attention to detail.',
      example: 'She kept meticulous records.',
      synonyms: ['careful', 'thorough'],
    })
  })

  it('prefers the top-level phonetic and dedupes synonyms', () => {
    const result = parseEntries([
      {
        phonetic: '/baɪt/',
        phonetics: [{ text: '/other/' }],
        meanings: [
          { partOfSpeech: 'verb', definitions: [{ definition: 'x', synonyms: ['nibble'] }], synonyms: ['nibble', 'chew'] },
        ],
      },
    ])
    expect(result?.ipa).toBe('/baɪt/')
    expect(result?.synonyms).toEqual(['nibble', 'chew'])
    expect(result?.example).toBeNull()
  })
})
