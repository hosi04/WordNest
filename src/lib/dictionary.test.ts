import { describe, expect, it } from 'vitest'
import { parseEntries, parseWiktionary, stripHtml } from './dictionary'

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

describe('stripHtml', () => {
  it('removes tags, nested sense lists and entities', () => {
    expect(
      stripHtml('Returning <a href="/wiki/x">quickly</a>; elastic. \n<ol><li>Sub-sense</li></ol> &amp; more'),
    ).toBe('Returning quickly; elastic. & more')
  })

  it('drops inline <style> blocks', () => {
    expect(stripHtml('A paved surface. <style data-mw="x">.mw-parser-output .defdate{font-size:smaller}</style>')).toBe(
      'A paved surface.',
    )
  })
})

describe('parseWiktionary', () => {
  it('uses the first non-empty English definition and example', () => {
    const result = parseWiktionary({
      en: [
        {
          partOfSpeech: 'Verb',
          definitions: [
            { definition: '<span class="usage-label-sense"></span>' },
            {
              definition: 'To <a href="/wiki/cut">cut</a> into something with the teeth.',
              parsedExamples: [{ example: 'As soon as you <b>bite</b> that sandwich...' }],
            },
          ],
        },
      ],
    })
    expect(result).toEqual({
      ipa: null,
      partOfSpeech: 'verb',
      definition: 'To cut into something with the teeth.',
      example: 'As soon as you bite that sandwich...',
      synonyms: [],
    })
  })

  it('returns null without English definitions', () => {
    expect(parseWiktionary({})).toBeNull()
    expect(parseWiktionary({ en: [{ definitions: [{ definition: '<span></span>' }] }] })).toBeNull()
  })
})
