import { expect, it } from 'vitest'
import { syntaxLowering } from '../src/lowering'

it('lowering', () => {
  expect(syntaxLowering('[:alnum:]'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "[0-9A-Za-z]",
      }
    `)

  expect(syntaxLowering('[:^alnum:]'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "[^0-9A-Za-z]",
      }
    `)

  expect(syntaxLowering('((?<![_$[:alnum:])\\]]|\\+\\+|--|}|\\*\\/)|((?<=^return|[^\\._$[:alnum:]]return|^case|[^\\._$[:alnum:]]case))\\s*)\\/(?![\\/*])(?=(?:[^\\/\\\\\\[]|\\\\.|\\[([^\\]\\\\]|\\\\.)*\\])+\\/([dgimsuy]+|(?![\\/\\*])|(?=\\/\\*))(?!\\s*[a-zA-Z0-9_$]))'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "((?<![_$0-9A-Za-z)\\]]|\\+\\+|--|}|\\*\\/)|((?<=^return|[^\\._$0-9A-Za-z]return|^case|[^\\._$0-9A-Za-z]case))\\s*)\\/(?![\\/*])(?=(?:[^\\/\\\\\\[]|\\\\.|\\[([^\\]\\\\]|\\\\.)*\\])+\\/([dgimsuy]+|(?![\\/\\*])|(?=\\/\\*))(?!\\s*[a-zA-Z0-9_$]))",
      }
    `)

  expect(syntaxLowering('(?x)\n  (?:\n    \\# \\s* (type:)\n    \\s*+ (?# we want `\\s*+` which is possessive quantifier since\n             we do not actually want to backtrack when matching\n             whitespace here)\n    (?! $ | \\#)\n  )\n'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "(?:\\#\\s*(type:)\\s*+(?!$|\\#))",
      }
    `)

  expect(syntaxLowering('^(?x)\n\t\t\t\t\t\t\\s*(to|on)\\s+ \t\t\t\t\t# "on" or "to"\n\t\t\t\t\t\t(\\w+)\t\t\t\t\t\t\t# function name\n\t\t\t\t\t\t(?=\\s*(--.*?)?$)\t\t\t\t# nothing else\n\t\t\t\t\t'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "^\\s*(to|on)\\s+(\\w+)(?=\\s*(--.*?)?$)",
      }
    `)

  expect(syntaxLowering('(?x)\n                        (?x:\n                              (null|Null|NULL|~)\n                            | (y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF)\n                            | (\n                                (?:\n                                      [-+]? 0b [0-1_]+ # (base 2)\n                                    | [-+]? 0  [0-7_]+ # (base 8)\n                                    | [-+]? (?: 0|[1-9][0-9_]*) # (base 10)\n                                    | [-+]? 0x [0-9a-fA-F_]+ # (base 16)\n                                    | [-+]? [1-9] [0-9_]* (?: :[0-5]?[0-9])+ # (base 60)\n                                )\n                              )\n                            | (\n                                (?x:\n                                      [-+]? (?: [0-9] [0-9_]*)? \\. [0-9.]* (?: [eE] [-+] [0-9]+)? # (base 10)\n                                    | [-+]? [0-9] [0-9_]* (?: :[0-5]?[0-9])+ \\. [0-9_]* # (base 60)\n                                    | [-+]? \\. (?: inf|Inf|INF) # (infinity)\n                                    |       \\. (?: nan|NaN|NAN) # (not a number)\n                                )\n                              )\n                            | (\n                                (?x:\n                                    \\d{4} - \\d{2} - \\d{2}           # (y-m-d)\n                                  | \\d{4}                           # (year)\n                                    - \\d{1,2}                       # (month)\n                                    - \\d{1,2}                       # (day)\n                                    (?: [Tt] | [ \\t]+) \\d{1,2}      # (hour)\n                                    : \\d{2}                         # (minute)\n                                    : \\d{2}                         # (second)\n                                    (?: \\.\\d*)?                     # (fraction)\n                                    (?:\n                                          (?:[ \\t]*) Z\n                                        | [-+] \\d{1,2} (?: :\\d{1,2})?\n                                    )?                              # (time zone)\n                                )\n                              )\n                            | (=)\n                            | (<<)\n                        )\n                        (?:\n                            (?=\n                                  \\s* $\n                                | \\s+ \\#\n                                | \\s* : (\\s|$)\n                                | \\s* : [\\[\\]{},]\n                                | \\s* [\\[\\]{},]\n                            )\n                        )\n                    '))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "(?:(null|Null|NULL|~)|(y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF)|((?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?(?:0|[1-9][0-9_]*)|[-+]?0x[0-9a-fA-F_]+|[-+]?[1-9][0-9_]*(?::[0-5]?[0-9])+))|((?:[-+]?(?:[0-9][0-9_]*)?\\.[0-9.]*(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN)))|((?:\\d{4}-\\d{2}-\\d{2}|\\d{4}-\\d{1,2}-\\d{1,2}(?:[Tt]|[ \\t]+)\\d{1,2}:\\d{2}:\\d{2}(?:\\.\\d*)?(?:(?:[ \\t]*)Z|[-+]\\d{1,2}(?::\\d{1,2})?)?))|(=)|(<<))(?:(?=\\s*$|\\s+\\#|\\s*:(\\s|$)|\\s*:[\\[\\]{},]|\\s*[\\[\\]{},]))",
      }
    `)

  expect(syntaxLowering('(?x) (?:\n  (?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(\\basync)\n)? ((?<![})!\\]])\\s*\n  (?=\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\\'\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\\'([^\\\'\\\\]|\\\\.)*\\\')|(\\"([^\\"\\\\]|\\\\.)*\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  )\n)'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "(?:(?<![_$0-9A-Za-z])(?:(?<=\\.\\.\\.)|(?<!\\.))(\\basync))?((?<![})!\\]])\\s*(?=((<\\s*(((const\\s+)?[_$A-Za-z])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$A-Za-z])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$A-Za-z])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([)]\\s*:)|((\\.\\.\\.\\s*)?[_$A-Za-z][_$0-9A-Za-z]*\\s*:)))|([<]\\s*[_$A-Za-z][_$0-9A-Za-z]*\\s+extends\\s*[^=>])|((<\\s*(((const\\s+)?[_$A-Za-z])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$A-Za-z])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$A-Za-z])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$A-Za-z]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$A-Za-z]))([^()\\'\\"\\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\"([^\\"\\\\]|\\\\.)*\\")|(\\\`([^\\\`\\\\]|\\\\.)*\\\`))*)?\\)(\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?\\s*=>)))",
      }
    `)

  expect(syntaxLowering('(?x)\n((@)borrows) \\s+\n((?:[^@\\s*/]|\\*[^/])+)    # <that namepath>\n\\s+ (as) \\s+              # as\n((?:[^@\\s*/]|\\*[^/])+)    # <this namepath>'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "((@)borrows)\\s+((?:[^@\\s*/]|\\*[^/])+)\\s+(as)\\s+((?:[^@\\s*/]|\\*[^/])+)",
      }
    `)

  expect(syntaxLowering('\\b(?x:\n\t\t\t\t(array)\\s+                       # 1: array keyword\n\t\t\t\t([A-Za-z_]\\w*)?                  # 2: var name\n\t\t\t\t# Note: Handle size decl and init expression inside.\n\t\t\t\t# TODO: Properly annotate brackets.\n\t\t\t)'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "\\b(?:(array)\\s+([A-Za-z_]\\w*)?)",
      }
    `)

  expect(syntaxLowering('(?x:\\G\\s*(?:\n  (-webkit-[-A-Za-z]+|-moz-[-A-Za-z]+|-o-[-A-Za-z]+|-ms-[-A-Za-z]+|-khtml-[-A-Za-z]+|zoom|z-index|y|x|wrap|word-wrap|word-spacing|word-break|word|width|widows|white-space-collapse|white-space|white|weight|volume|voice-volume|voice-stress|voice-rate|voice-pitch-range|voice-pitch|voice-family|voice-duration|voice-balance|voice|visibility|vertical-align|variant|user-select|up|unicode-bidi|unicode-range|unicode|trim|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform|touch-action|top-width|top-style|top-right-radius|top-left-radius|top-color|top|timing-function|text-wrap|text-transform|text-shadow|text-replace|text-rendering|text-overflow|text-outline|text-justify|text-indent|text-height|text-emphasis|text-decoration|text-align-last|text-align|text|target-position|target-new|target-name|target|table-layout|tab-size|style-type|style-position|style-image|style|string-set|stretch|stress|stacking-strategy|stacking-shift|stacking-ruby|stacking|src|speed|speech-rate|speech|speak-punctuation|speak-numeral|speak-header|speak|span|spacing|space-collapse|space|sizing|size-adjust|size|shadow|respond-to|rule-width|rule-style|rule-color|rule|ruby-span|ruby-position|ruby-overhang|ruby-align|ruby|rows|rotation-point|rotation|role|right-width|right-style|right-color|right|richness|rest-before|rest-after|rest|resource|resize|reset|replace|repeat|rendering-intent|rate|radius|quotes|punctuation-trim|punctuation|property|profile|presentation-level|presentation|position|pointer-events|point|play-state|play-during|play-count|pitch-range|pitch|phonemes|pause-before|pause-after|pause|page-policy|page-break-inside|page-break-before|page-break-after|page|padding-top|padding-right|padding-left|padding-bottom|padding|pack|overhang|overflow-y|overflow-x|overflow-style|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|origin|orientation|orient|ordinal-group|order|opacity|offset|numeral|new|nav-up|nav-right|nav-left|nav-index|nav-down|nav|name|move-to|model|mix-blend-mode|min-width|min-height|min|max-width|max-height|max|marquee-style|marquee-speed|marquee-play-count|marquee-direction|marquee|marks|mark-before|mark-after|mark|margin-top|margin-right|margin-left|margin-bottom|margin|mask-image|list-style-type|list-style-position|list-style-image|list-style|list|lines|line-stacking-strategy|line-stacking-shift|line-stacking-ruby|line-stacking|line-height|line-break|level|letter-spacing|length|left-width|left-style|left-color|left|label|justify-content|justify|iteration-count|inline-box-align|initial-value|initial-size|initial-before-align|initial-before-adjust|initial-after-align|initial-after-adjust|index|indent|increment|image-resolution|image-orientation|image|icon|hyphens|hyphenate-resource|hyphenate-lines|hyphenate-character|hyphenate-before|hyphenate-after|hyphenate|height|header|hanging-punctuation|gap|grid|grid-area|grid-auto-columns|grid-auto-flow|grid-auto-rows|grid-column|grid-column-end|grid-column-start|grid-row|grid-row-end|grid-row-start|grid-template|grid-template-areas|grid-template-columns|grid-template-rows|row-gap|gap|font-kerning|font-language-override|font-weight|font-variant-caps|font-variant|font-style|font-synthesis|font-stretch|font-size-adjust|font-size|font-family|font|float-offset|float|flex-wrap|flex-shrink|flex-grow|flex-group|flex-flow|flex-direction|flex-basis|flex|fit-position|fit|fill|filter|family|empty-cells|emphasis|elevation|duration|drop-initial-value|drop-initial-size|drop-initial-before-align|drop-initial-before-adjust|drop-initial-after-align|drop-initial-after-adjust|drop|down|dominant-baseline|display-role|display-model|display|direction|delay|decoration-break|decoration|cursor|cue-before|cue-after|cue|crop|counter-reset|counter-increment|counter|count|content|columns|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|column-break-before|column-break-after|column|color-profile|color|collapse|clip|clear|character|caption-side|break-inside|break-before|break-after|break|box-sizing|box-shadow|box-pack|box-orient|box-ordinal-group|box-lines|box-flex-group|box-flex|box-direction|box-decoration-break|box-align|box|bottom-width|bottom-style|bottom-right-radius|bottom-left-radius|bottom-color|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-length|border-left-width|border-left-style|border-left-color|border-left|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|bookmark-target|bookmark-level|bookmark-label|bookmark|binding|bidi|before|baseline-shift|baseline|balance|background-blend-mode|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-break|background-attachment|background|azimuth|attachment|appearance|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-duration|animation-direction|animation-delay|animation-fill-mode|animation|alignment-baseline|alignment-adjust|alignment|align-self|align-last|align-items|align-content|align|after|adjust|will-change)|\n  (writing-mode|text-anchor|stroke-width|stroke-opacity|stroke-miterlimit|stroke-linejoin|stroke-linecap|stroke-dashoffset|stroke-dasharray|stroke|stop-opacity|stop-color|shape-rendering|marker-start|marker-mid|marker-end|lighting-color|kerning|image-rendering|glyph-orientation-vertical|glyph-orientation-horizontal|flood-opacity|flood-color|fill-rule|fill-opacity|fill|enable-background|color-rendering|color-interpolation-filters|color-interpolation|clip-rule|clip-path)|\n  ([a-zA-Z_-][a-zA-Z0-9_-]*)\n)(?!([^\\S\\n]*&)|([^\\S\\n]*\\{))(?=:|([^\\S\\n]+[^\\s])))'))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "(?:\\G\\s*(?:(-webkit-[-A-Za-z]+|-moz-[-A-Za-z]+|-o-[-A-Za-z]+|-ms-[-A-Za-z]+|-khtml-[-A-Za-z]+|zoom|z-index|y|x|wrap|word-wrap|word-spacing|word-break|word|width|widows|white-space-collapse|white-space|white|weight|volume|voice-volume|voice-stress|voice-rate|voice-pitch-range|voice-pitch|voice-family|voice-duration|voice-balance|voice|visibility|vertical-align|variant|user-select|up|unicode-bidi|unicode-range|unicode|trim|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform|touch-action|top-width|top-style|top-right-radius|top-left-radius|top-color|top|timing-function|text-wrap|text-transform|text-shadow|text-replace|text-rendering|text-overflow|text-outline|text-justify|text-indent|text-height|text-emphasis|text-decoration|text-align-last|text-align|text|target-position|target-new|target-name|target|table-layout|tab-size|style-type|style-position|style-image|style|string-set|stretch|stress|stacking-strategy|stacking-shift|stacking-ruby|stacking|src|speed|speech-rate|speech|speak-punctuation|speak-numeral|speak-header|speak|span|spacing|space-collapse|space|sizing|size-adjust|size|shadow|respond-to|rule-width|rule-style|rule-color|rule|ruby-span|ruby-position|ruby-overhang|ruby-align|ruby|rows|rotation-point|rotation|role|right-width|right-style|right-color|right|richness|rest-before|rest-after|rest|resource|resize|reset|replace|repeat|rendering-intent|rate|radius|quotes|punctuation-trim|punctuation|property|profile|presentation-level|presentation|position|pointer-events|point|play-state|play-during|play-count|pitch-range|pitch|phonemes|pause-before|pause-after|pause|page-policy|page-break-inside|page-break-before|page-break-after|page|padding-top|padding-right|padding-left|padding-bottom|padding|pack|overhang|overflow-y|overflow-x|overflow-style|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|origin|orientation|orient|ordinal-group|order|opacity|offset|numeral|new|nav-up|nav-right|nav-left|nav-index|nav-down|nav|name|move-to|model|mix-blend-mode|min-width|min-height|min|max-width|max-height|max|marquee-style|marquee-speed|marquee-play-count|marquee-direction|marquee|marks|mark-before|mark-after|mark|margin-top|margin-right|margin-left|margin-bottom|margin|mask-image|list-style-type|list-style-position|list-style-image|list-style|list|lines|line-stacking-strategy|line-stacking-shift|line-stacking-ruby|line-stacking|line-height|line-break|level|letter-spacing|length|left-width|left-style|left-color|left|label|justify-content|justify|iteration-count|inline-box-align|initial-value|initial-size|initial-before-align|initial-before-adjust|initial-after-align|initial-after-adjust|index|indent|increment|image-resolution|image-orientation|image|icon|hyphens|hyphenate-resource|hyphenate-lines|hyphenate-character|hyphenate-before|hyphenate-after|hyphenate|height|header|hanging-punctuation|gap|grid|grid-area|grid-auto-columns|grid-auto-flow|grid-auto-rows|grid-column|grid-column-end|grid-column-start|grid-row|grid-row-end|grid-row-start|grid-template|grid-template-areas|grid-template-columns|grid-template-rows|row-gap|gap|font-kerning|font-language-override|font-weight|font-variant-caps|font-variant|font-style|font-synthesis|font-stretch|font-size-adjust|font-size|font-family|font|float-offset|float|flex-wrap|flex-shrink|flex-grow|flex-group|flex-flow|flex-direction|flex-basis|flex|fit-position|fit|fill|filter|family|empty-cells|emphasis|elevation|duration|drop-initial-value|drop-initial-size|drop-initial-before-align|drop-initial-before-adjust|drop-initial-after-align|drop-initial-after-adjust|drop|down|dominant-baseline|display-role|display-model|display|direction|delay|decoration-break|decoration|cursor|cue-before|cue-after|cue|crop|counter-reset|counter-increment|counter|count|content|columns|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|column-break-before|column-break-after|column|color-profile|color|collapse|clip|clear|character|caption-side|break-inside|break-before|break-after|break|box-sizing|box-shadow|box-pack|box-orient|box-ordinal-group|box-lines|box-flex-group|box-flex|box-direction|box-decoration-break|box-align|box|bottom-width|bottom-style|bottom-right-radius|bottom-left-radius|bottom-color|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-length|border-left-width|border-left-style|border-left-color|border-left|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|bookmark-target|bookmark-level|bookmark-label|bookmark|binding|bidi|before|baseline-shift|baseline|balance|background-blend-mode|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-break|background-attachment|background|azimuth|attachment|appearance|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-duration|animation-direction|animation-delay|animation-fill-mode|animation|alignment-baseline|alignment-adjust|alignment|align-self|align-last|align-items|align-content|align|after|adjust|will-change)|(writing-mode|text-anchor|stroke-width|stroke-opacity|stroke-miterlimit|stroke-linejoin|stroke-linecap|stroke-dashoffset|stroke-dasharray|stroke|stop-opacity|stop-color|shape-rendering|marker-start|marker-mid|marker-end|lighting-color|kerning|image-rendering|glyph-orientation-vertical|glyph-orientation-horizontal|flood-opacity|flood-color|fill-rule|fill-opacity|fill|enable-background|color-rendering|color-interpolation-filters|color-interpolation|clip-rule|clip-path)|([a-zA-Z_-][a-zA-Z0-9_-]*))(?!([^\\S\\n]*&)|([^\\S\\n]*\\{))(?=:|([^\\S\\n]+[^\\s])))",
      }
    `)
})

it('lowering mixed flags', () => {
  expect(syntaxLowering(
    '(?xi)\n'
    + '((@)(annotation|character-variant|ornaments|styleset|stylistic|swash))\n'
    + `(?=[\\s@'"{;]|/\\*|$)`,
  ))
    .toMatchInlineSnapshot(`
      {
        "flags": "i",
        "pattern": "((@)(annotation|character-variant|ornaments|styleset|stylistic|swash))(?=[\\s@'"{;]|/\\*|$)",
      }
    `)

  expect(syntaxLowering('foo(?xi:\n[:alnum:]\n)'))
    .toMatchInlineSnapshot(`
      {
        "flags": "i",
        "pattern": "foo(?:[0-9A-Za-z])",
      }
    `)

  expect(syntaxLowering('foo(?xi:\n[:alnum:]\n)', { preserveFlags: true }))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "foo(?i:[0-9A-Za-z])",
      }
    `)
})

it('lowering \\h', () => {
  expect(syntaxLowering('(?x)\\h [\\h\\w] \\H', { convertHexDigitsShorthand: true }))
    .toMatchInlineSnapshot(`
      {
        "flags": "",
        "pattern": "[0-9A-Fa-f][0-9A-Fa-f\\w][^0-9A-Fa-f]",
      }
    `)
})
