import type { editor } from 'monaco-editor';

const cristataCodeDarkTheme: editor.IStandaloneThemeData = {
  inherit: false,
  base: 'vs-dark',
  colors: {
    'activityBar.background': '#242424',
    'activityBar.border': '#3b3b3b',
    'activityBarBadge.background': '#343434',
    'button.background': '#0971f1',
    'button.foreground': '#ffffff',
    contrastBorder: '#3b3b3b',
    'dropdown.background': '#242424',
    'dropdown.border': '#3b3b3b',
    'dropdown.foreground': '#ffffff',
    'editor.background': '#242424',
    'editor.foreground': '#999999',
    'editor.hoverHighlightBackground': '#343434',
    'editor.inactiveSelectionBackground': '#343434',
    'editor.lineHighlightBackground': '#3b3b3b',
    'editor.lineHighlightBorder': '#3b3b3b',
    'editor.rangeHighlightBackground': '#3b3b3b',
    'editor.selectionBackground': '#3793e033',
    'editor.selectionHighlightBackground': '#3b3b3b',
    'editor.wordHighlightBackground': '#3b3b3b',
    'editor.wordHighlightStrongBackground': '#3b3b3b',
    'editorBracketMatch.background': '#3b3b3b',
    'editorBracketMatch.border': '#3b3b3b',
    'editorCodeLens.foreground': '#3b3b3b',
    'editorCursor.background': '#242424',
    'editorCursor.foreground': '#ffffff',
    'editorError.border': '#3b3b3b',
    'editorError.foreground': '#e1270e',
    'editorGroup.border': '#3b3b3b',
    'editorGroup.dropBackground': '#3793e01a',
    'editorGroup.emptyBackground': '#242424',
    'editorGroupHeader.tabsBackground': '#242424',
    'editorGroupHeader.tabsBorder': '#3b3b3b',
    'editorGutter.background': '#242424',
    'editorHoverWidget.background': '#242424',
    'editorHoverWidget.border': '#3b3b3b',
    'editorIndentGuide.background': '#2e2e2e',
    'editorLineNumber.activeForeground': '#e6e6e6',
    'editorLineNumber.foreground': '#757575',
    'editorLink.activeForeground': '#999999',
    'editorMarkerNavigation.background': '#242424',
    'editorMarkerNavigationError.background': '#242424',
    'editorMarkerNavigationWarning.background': '#3b3b3b',
    'editorOverviewRuler.border': '#3b3b3b',
    'editorOverviewRuler.commonContentForeground': '#3b3b3b',
    'editorOverviewRuler.currentContentForeground': '#e1270e',
    'editorOverviewRuler.incomingContentForeground': '#5bc266',
    'editorRuler.foreground': '#999999',
    'editorSuggestWidget.background': '#242424',
    'editorSuggestWidget.border': '#3b3b3b',
    'editorSuggestWidget.foreground': '#999999',
    'editorSuggestWidget.selectedBackground': '#3b3b3b',
    'editorWarning.border': '#3b3b3b',
    'editorWarning.foreground': '#ff453a',
    'editorWhitespace.foreground': '#343434',
    'editorWidget.background': '#242424',
    'editorWidget.border': '#3b3b3b',
    errorForeground: '#e1270e',
    focusBorder: '#3b3b3b',
    foreground: '#e6e6e6',
    'input.background': '#3b3b3b',
    'input.border': '#040404',
    'input.foreground': '#ffffff',
    'input.placeholderForeground': '#999999',
    'inputOption.activeBorder': '#343434',
    'inputValidation.errorBorder': '#e1270e',
    'inputValidation.infoBorder': '#bf5af2',
    'inputValidation.warningBorder': '#fbcc43',
    'list.activeSelectionBackground': '#3b3b3b',
    'list.activeSelectionForeground': '#ffffff',
    'list.dropBackground': '#242424',
    'list.errorForeground': '#e1270e',
    'list.focusBackground': '#3b3b3b',
    'list.highlightForeground': '#6cc7f6',
    'list.hoverBackground': '#3b3b3b',
    'list.inactiveSelectionBackground': '#3b3b3b',
    'list.inactiveSelectionForeground': '#ffffff',
    'list.warningForeground': '#fbcc43',
    'menu.background': '#242424',
    'menu.selectionBackground': '#3b3b3b',
    'peekView.border': '#343434',
    'peekViewEditor.background': '#3b3b3b',
    'peekViewEditor.matchHighlightBackground': '#3793e033',
    'peekViewResult.background': '#3b3b3b',
    'peekViewResult.fileForeground': '#ffffff',
    'peekViewResult.lineForeground': '#ffffff',
    'peekViewResult.matchHighlightBackground': '#3793e033',
    'peekViewResult.selectionBackground': '#3b3b3b',
    'peekViewResult.selectionForeground': '#ffffff',
    'peekViewTitle.background': '#3b3b3b',
    'peekViewTitleDescription.foreground': '#535bcf',
    'peekViewTitleLabel.foreground': '#ffffff',
    'scrollbarSlider.activeBackground': '#ffffff',
    'selection.background': '#3793e040',
    'sideBar.background': '#242424',
    'sideBar.border': '#3b3b3b',
    'sideBar.foreground': '#e6e6e6',
    'sideBarSectionHeader.background': '#242424',
    'sideBarSectionHeader.border': '#3b3b3b',
    'sideBarSectionHeader.foreground': '#ffffff',
    'sideBarTitle.foreground': '#ffffff',
    'statusBar.background': '#3b3b3b',
    'statusBar.border': '#3b3b3b',
    'statusBar.foreground': '#ffffff',
    'statusBar.noFolderBackground': '#3b3b3b',
    'statusBar.noFolderForeground': '#ffffff',
    'statusBarItem.prominentBackground': '#e1270e',
    'statusBarItem.prominentHoverBackground': '#fbcc43',
    'tab.activeBackground': '#242424',
    'tab.activeBorder': '#6cc7f6',
    'tab.activeForeground': '#ffffff',
    'tab.border': '#3b3b3b',
    'tab.inactiveBackground': '#242424',
    'tab.inactiveForeground': '#757575',
    'tab.unfocusedActiveForeground': '#ffffff',
    'tab.unfocusedInactiveForeground': '#757575',
    'terminal.background': '#242424',
    'terminal.foreground': '#ffffff',
    'titleBar.activeBackground': '#242424',
    'titleBar.activeForeground': '#ffffff',
    'titleBar.border': '#3b3b3b',
    'titleBar.inactiveBackground': '#242424',
    'titleBar.inactiveForeground': '#999999',
  },
  rules: [
    { token: 'string.key.json', foreground: '#e06c75' },
    { token: 'string.value.json', foreground: '#98c379' },
    { token: 'boolean.value.json', foreground: '#569cd6' },
    { token: 'null.value.json', foreground: '#569cd6' },
    { token: 'undefined.value.json', foreground: '#569cd6' },
    { token: 'number.value.json', foreground: '#d19a66' },
    {
      foreground: '#5C6370',
      fontStyle: 'italic',
      token: 'comment',
    },
    {
      foreground: '#5C6370',
      token: 'comment markup.link',
    },
    {
      foreground: '#E5C07B',
      token: 'entity.name.type',
    },
    {
      foreground: '#98C379',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: '#C678DD',
      token: 'keyword',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.control',
    },
    {
      foreground: '#ABB2BF',
      token: 'keyword.operator',
    },
    {
      foreground: '#61AFEF',
      token: 'keyword.other.special-method',
    },
    {
      foreground: '#D19A66',
      token: 'keyword.other.unit',
    },
    {
      foreground: '#C678DD',
      token: 'storage',
    },
    {
      foreground: '#C678DD',
      token: 'storage.type.annotation',
    },
    {
      foreground: '#C678DD',
      token: 'storage.type.primitive',
    },
    {
      foreground: '#ABB2BF',
      token: 'storage.modifier.package',
    },
    {
      foreground: '#ABB2BF',
      token: 'storage.modifier.import',
    },
    {
      foreground: '#D19A66',
      token: 'constant',
    },
    {
      foreground: '#D19A66',
      token: 'constant.variable',
    },
    {
      foreground: '#56B6C2',
      token: 'constant.character.escape',
    },
    {
      foreground: '#D19A66',
      token: 'constant.numeric',
    },
    {
      foreground: '#56B6C2',
      token: 'constant.other.color',
    },
    {
      foreground: '#56B6C2',
      token: 'constant.other.symbol',
    },
    {
      foreground: '#E06C75',
      token: 'variable',
    },
    {
      foreground: '#BE5046',
      token: 'variable.interpolation',
    },
    {
      foreground: '#ABB2BF',
      token: 'variable.parameter',
    },
    {
      foreground: '#98C379',
      token: 'string',
    },
    {
      foreground: '#56B6C2',
      token: 'string.regexp',
    },
    {
      foreground: '#E5C07B',
      token: 'string.regexp source.ruby.embedded',
    },
    {
      foreground: '#E06C75',
      token: 'string.other.link',
    },
    {
      foreground: '#5C6370',
      token: 'punctuation.definition.comment',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.method-parameters',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.function-parameters',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.parameters',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.separator',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.seperator',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.array',
    },
    {
      foreground: '#61AFEF',
      token: 'punctuation.definition.heading',
    },
    {
      foreground: '#61AFEF',
      token: 'punctuation.definition.identity',
    },
    {
      foreground: '#E5C07B',
      fontStyle: 'bold',
      token: 'punctuation.definition.bold',
    },
    {
      foreground: '#C678DD',
      fontStyle: 'italic',
      token: 'punctuation.definition.italic',
    },
    {
      foreground: '#BE5046',
      token: 'punctuation.section.embedded',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.section.method',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.section.class',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.section.inner-class',
    },
    {
      foreground: '#E5C07B',
      token: 'support.class',
    },
    {
      foreground: '#56B6C2',
      token: 'support.type',
    },
    {
      foreground: '#56B6C2',
      token: 'support.function',
    },
    {
      foreground: '#61AFEF',
      token: 'support.function.any-method',
    },
    {
      foreground: '#61AFEF',
      token: 'entity.name.function',
    },
    {
      foreground: '#E5C07B',
      token: 'entity.name.class',
    },
    {
      foreground: '#E5C07B',
      token: 'entity.name.type.class',
    },
    {
      foreground: '#61AFEF',
      token: 'entity.name.section',
    },
    {
      foreground: '#E06C75',
      token: 'entity.name.tag',
    },
    {
      foreground: '#D19A66',
      token: 'entity.other.attribute-name',
    },
    {
      foreground: '#61AFEF',
      token: 'entity.other.attribute-name.id',
    },
    {
      foreground: '#E5C07B',
      token: 'meta.class',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.class.body',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.method-call',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.method',
    },
    {
      foreground: '#E06C75',
      token: 'meta.definition.variable',
    },
    {
      foreground: '#D19A66',
      token: 'meta.link',
    },
    {
      foreground: '#61AFEF',
      token: 'meta.require',
    },
    {
      foreground: '#C678DD',
      token: 'meta.selector',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.separator',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.tag',
    },
    {
      foreground: '#ABB2BF',
      token: 'none',
    },
    {
      foreground: '#523D14',
      token: 'invalid.deprecated',
    },
    {
      foreground: '#FFFFFF',
      token: 'invalid.illegal',
    },
    {
      foreground: '#D19A66',
      fontStyle: 'bold',
      token: 'markup.bold',
    },
    {
      foreground: '#C678DD',
      token: 'markup.changed',
    },
    {
      foreground: '#E06C75',
      token: 'markup.deleted',
    },
    {
      foreground: '#C678DD',
      fontStyle: 'italic',
      token: 'markup.italic',
    },
    {
      foreground: '#E06C75',
      token: 'markup.heading',
    },
    {
      foreground: '#61AFEF',
      token: 'markup.heading punctuation.definition.heading',
    },
    {
      foreground: '#C678DD',
      token: 'markup.link',
    },
    {
      foreground: '#98C379',
      token: 'markup.inserted',
    },
    {
      foreground: '#D19A66',
      token: 'markup.quote',
    },
    {
      foreground: '#98C379',
      token: 'markup.raw',
    },
    {
      foreground: '#C678DD',
      token: 'source.c keyword.operator',
    },
    {
      foreground: '#C678DD',
      token: 'source.cpp keyword.operator',
    },
    {
      foreground: '#C678DD',
      token: 'source.cs keyword.operator',
    },
    {
      foreground: '#828997',
      token: 'source.css property-name',
    },
    {
      foreground: '#828997',
      token: 'source.css property-value',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.css property-name.support',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.css property-value.support',
    },
    {
      foreground: '#61AFEF',
      token: 'source.gfm link entity',
    },
    {
      foreground: '#C678DD',
      token: 'source.go storage.type.string',
    },
    {
      foreground: '#E06C75',
      token: 'source.ini keyword.other.definition.ini',
    },
    {
      foreground: '#E5C07B',
      token: 'source.java storage.modifier.import',
    },
    {
      foreground: '#E5C07B',
      token: 'source.java storage.type',
    },
    {
      foreground: '#C678DD',
      token: 'source.java keyword.operator.instanceof',
    },
    {
      foreground: '#E06C75',
      token: 'source.java-properties meta.key-pair',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.java-properties meta.key-pair > punctuation',
    },
    {
      foreground: '#56B6C2',
      token: 'source.js keyword.operator',
    },
    {
      foreground: '#C678DD',
      token: 'source.js keyword.operator.delete',
    },
    {
      foreground: '#C678DD',
      token: 'source.js keyword.operator.in',
    },
    {
      foreground: '#C678DD',
      token: 'source.js keyword.operator.of',
    },
    {
      foreground: '#C678DD',
      token: 'source.js keyword.operator.instanceof',
    },
    {
      foreground: '#C678DD',
      token: 'source.js keyword.operator.new',
    },
    {
      foreground: '#C678DD',
      token: 'source.js keyword.operator.typeof',
    },
    {
      foreground: '#C678DD',
      token: 'source.js keyword.operator.void',
    },
    {
      foreground: '#E06C75',
      token: 'source.json meta.structure.dictionary.json > string.quoted.json',
    },
    {
      foreground: '#E06C75',
      token: 'source.json meta.structure.dictionary.json > string.quoted.json > punctuation.string',
    },
    {
      foreground: '#98C379',
      token: 'source.json meta.structure.dictionary.json > value.json > string.quoted.json',
    },
    {
      foreground: '#98C379',
      token: 'source.json meta.structure.array.json > value.json > string.quoted.json',
    },
    {
      foreground: '#98C379',
      token:
        'source.json meta.structure.dictionary.json > value.json > string.quoted.json > punctuation',
    },
    {
      foreground: '#98C379',
      token:
        'source.json meta.structure.array.json > value.json > string.quoted.json > punctuation',
    },
    {
      foreground: '#56B6C2',
      token: 'source.json meta.structure.dictionary.json > constant.language.json',
    },
    {
      foreground: '#56B6C2',
      token: 'source.json meta.structure.array.json > constant.language.json',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.ruby constant.other.symbol > punctuation',
    },
    {
      foreground: '#C678DD',
      token: 'source.python keyword.operator.logical.python',
    },
    {
      foreground: '#D19A66',
      token: 'source.python variable.parameter',
    },
    {
      foreground: '#BCC199',
      token: 'meta.attribute.rust',
    },
    {
      foreground: '#33E8EC',
      token: 'storage.modifier.lifetime.rust',
    },
    {
      foreground: '#33E8EC',
      token: 'entity.name.lifetime.rust',
    },
    {
      foreground: '#CC6B73',
      token: 'keyword.unsafe.rust',
    },
    {
      foreground: '#ABB2BF',
      token: 'customrule',
    },
    {
      foreground: '#ABB2BF',
      token: 'support.type.property-name',
    },
    {
      foreground: '#98C379',
      token: 'string.quoted.double punctuation',
    },
    {
      foreground: '#D19A66',
      token: 'support.constant',
    },
    {
      foreground: '#E06C75',
      token: 'support.type.property-name.json',
    },
    {
      foreground: '#E06C75',
      token: 'support.type.property-name.json punctuation',
    },
    {
      foreground: '#56B6C2',
      token: 'punctuation.separator.key-value.ts',
    },
    {
      foreground: '#56B6C2',
      token: 'punctuation.separator.key-value.js',
    },
    {
      foreground: '#56B6C2',
      token: 'punctuation.separator.key-value.tsx',
    },
    {
      foreground: '#56B6C2',
      token: 'source.js.embedded.html keyword.operator',
    },
    {
      foreground: '#56B6C2',
      token: 'source.ts.embedded.html keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'variable.other.readwrite.js',
    },
    {
      foreground: '#ABB2BF',
      token: 'variable.other.readwrite.ts',
    },
    {
      foreground: '#ABB2BF',
      token: 'variable.other.readwrite.tsx',
    },
    {
      foreground: '#E06C75',
      token: 'support.variable.dom.js',
    },
    {
      foreground: '#E06C75',
      token: 'support.variable.dom.ts',
    },
    {
      foreground: '#E06C75',
      token: 'support.variable.property.dom.js',
    },
    {
      foreground: '#E06C75',
      token: 'support.variable.property.dom.ts',
    },
    {
      foreground: '#BE5046',
      token: 'meta.template.expression.js punctuation.definition',
    },
    {
      foreground: '#BE5046',
      token: 'meta.template.expression.ts punctuation.definition',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.ts punctuation.definition.typeparameters',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.js punctuation.definition.typeparameters',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.tsx punctuation.definition.typeparameters',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.ts punctuation.definition.block',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.js punctuation.definition.block',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.tsx punctuation.definition.block',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.ts punctuation.separator.comma',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.js punctuation.separator.comma',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.tsx punctuation.separator.comma',
    },
    {
      foreground: '#E06C75',
      token: 'support.variable.property.js',
    },
    {
      foreground: '#E06C75',
      token: 'support.variable.property.ts',
    },
    {
      foreground: '#E06C75',
      token: 'support.variable.property.tsx',
    },
    {
      foreground: '#E06C75',
      token: 'keyword.control.default.js',
    },
    {
      foreground: '#E06C75',
      token: 'keyword.control.default.ts',
    },
    {
      foreground: '#E06C75',
      token: 'keyword.control.default.tsx',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.instanceof.js',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.instanceof.ts',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.instanceof.tsx',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.of.js',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.of.ts',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.of.tsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.brace.round.js',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.array-binding-pattern-variable.js',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.brace.square.js',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.brace.round.ts',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.array-binding-pattern-variable.ts',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.brace.square.ts',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.brace.round.tsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.array-binding-pattern-variable.tsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.brace.square.tsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.js punctuation.accessor',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.ts punctuation.accessor',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.tsx punctuation.accessor',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.terminator.statement.js',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.terminator.statement.ts',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.terminator.statement.tsx',
    },
    {
      foreground: '#D19A66',
      token: 'meta.array-binding-pattern-variable.js variable.other.readwrite.js',
    },
    {
      foreground: '#D19A66',
      token: 'meta.array-binding-pattern-variable.ts variable.other.readwrite.ts',
    },
    {
      foreground: '#D19A66',
      token: 'meta.array-binding-pattern-variable.tsx variable.other.readwrite.tsx',
    },
    {
      foreground: '#E06C75',
      token: 'source.js support.variable',
    },
    {
      foreground: '#E06C75',
      token: 'source.ts support.variable',
    },
    {
      foreground: '#E06C75',
      token: 'source.tsx support.variable',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.property.js',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.property.ts',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.property.tsx',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.new.ts',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.new.j',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.new.tsx',
    },
    {
      foreground: '#56B6C2',
      token: 'source.ts keyword.operator',
    },
    {
      foreground: '#56B6C2',
      token: 'source.tsx keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.separator.parameter.js',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.separator.parameter.ts',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.separator.parameter.tsx ',
    },
    {
      foreground: '#E06C75',
      token: 'constant.language.import-export-all.js',
    },
    {
      foreground: '#E06C75',
      token: 'constant.language.import-export-all.ts',
    },
    {
      foreground: '#56B6C2',
      token: 'constant.language.import-export-all.jsx',
    },
    {
      foreground: '#56B6C2',
      token: 'constant.language.import-export-all.tsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'keyword.control.as.js',
    },
    {
      foreground: '#ABB2BF',
      token: 'keyword.control.as.ts',
    },
    {
      foreground: '#ABB2BF',
      token: 'keyword.control.as.jsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'keyword.control.as.tsx',
    },
    {
      foreground: '#E06C75',
      token: 'variable.other.readwrite.alias.js',
    },
    {
      foreground: '#E06C75',
      token: 'variable.other.readwrite.alias.ts',
    },
    {
      foreground: '#E06C75',
      token: 'variable.other.readwrite.alias.jsx',
    },
    {
      foreground: '#E06C75',
      token: 'variable.other.readwrite.alias.tsx',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.js',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.ts',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.jsx',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.tsx',
    },
    {
      foreground: '#E06C75',
      token: 'meta.export.default.js variable.other.readwrite.js',
    },
    {
      foreground: '#E06C75',
      token: 'meta.export.default.ts variable.other.readwrite.ts',
    },
    {
      foreground: '#98C379',
      token: 'source.js meta.template.expression.js punctuation.accessor',
    },
    {
      foreground: '#98C379',
      token: 'source.ts meta.template.expression.ts punctuation.accessor',
    },
    {
      foreground: '#98C379',
      token: 'source.tsx meta.template.expression.tsx punctuation.accessor',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.js meta.import-equals.external.js keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.jsx meta.import-equals.external.jsx keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.ts meta.import-equals.external.ts keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.tsx meta.import-equals.external.tsx keyword.operator',
    },
    {
      foreground: '#98C379',
      token: 'entity.name.type.module.js',
    },
    {
      foreground: '#98C379',
      token: 'entity.name.type.module.ts',
    },
    {
      foreground: '#98C379',
      token: 'entity.name.type.module.jsx',
    },
    {
      foreground: '#98C379',
      token: 'entity.name.type.module.tsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.class.js',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.class.ts',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.class.jsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.class.tsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.definition.property.js variable',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.definition.property.ts variable',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.definition.property.jsx variable',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.definition.property.tsx variable',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.type.parameters.js support.type',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.type.parameters.jsx support.type',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.type.parameters.ts support.type',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.type.parameters.tsx support.type',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.js meta.tag.js keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.jsx meta.tag.jsx keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.ts meta.tag.ts keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.tsx meta.tag.tsx keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.tag.js punctuation.section.embedded',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.tag.jsx punctuation.section.embedded',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.tag.ts punctuation.section.embedded',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.tag.tsx punctuation.section.embedded',
    },
    {
      foreground: '#E5C07B',
      token: 'meta.array.literal.js variable',
    },
    {
      foreground: '#E5C07B',
      token: 'meta.array.literal.jsx variable',
    },
    {
      foreground: '#E5C07B',
      token: 'meta.array.literal.ts variable',
    },
    {
      foreground: '#E5C07B',
      token: 'meta.array.literal.tsx variable',
    },
    {
      foreground: '#E06C75',
      token: 'support.type.object.module.js',
    },
    {
      foreground: '#E06C75',
      token: 'support.type.object.module.jsx',
    },
    {
      foreground: '#E06C75',
      token: 'support.type.object.module.ts',
    },
    {
      foreground: '#E06C75',
      token: 'support.type.object.module.tsx',
    },
    {
      foreground: '#56B6C2',
      token: 'constant.language.json',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.object.js',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.object.jsx',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.object.ts',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.object.tsx',
    },
    {
      foreground: '#56B6C2',
      token: 'storage.type.property.js',
    },
    {
      foreground: '#56B6C2',
      token: 'storage.type.property.jsx',
    },
    {
      foreground: '#56B6C2',
      token: 'storage.type.property.ts',
    },
    {
      foreground: '#56B6C2',
      token: 'storage.type.property.tsx',
    },
    {
      foreground: '#98C379',
      token: 'meta.template.expression.js string.quoted punctuation.definition',
    },
    {
      foreground: '#98C379',
      token: 'meta.template.expression.jsx string.quoted punctuation.definition',
    },
    {
      foreground: '#98C379',
      token: 'meta.template.expression.ts string.quoted punctuation.definition',
    },
    {
      foreground: '#98C379',
      token: 'meta.template.expression.tsx string.quoted punctuation.definition',
    },
    {
      foreground: '#98C379',
      token: 'meta.template.expression.js string.template punctuation.definition.string.template',
    },
    {
      foreground: '#98C379',
      token: 'meta.template.expression.jsx string.template punctuation.definition.string.template',
    },
    {
      foreground: '#98C379',
      token: 'meta.template.expression.ts string.template punctuation.definition.string.template',
    },
    {
      foreground: '#98C379',
      token: 'meta.template.expression.tsx string.template punctuation.definition.string.template',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.in.js',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.in.jsx',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.in.ts',
    },
    {
      foreground: '#C678DD',
      token: 'keyword.operator.expression.in.tsx',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.python constant.other',
    },
    {
      foreground: '#D19A66',
      token: 'source.python constant',
    },
    {
      foreground: '#D19A66',
      token: 'constant.character.format.placeholder.other.python storage',
    },
    {
      foreground: '#E06C75',
      token: 'support.variable.magic.python',
    },
    {
      foreground: '#D19A66',
      token: 'meta.function.parameters.python',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.separator.annotation.python',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.separator.parameters.python',
    },
    {
      foreground: '#E06C75',
      token: 'entity.name.variable.field.cs',
    },
    {
      foreground: '#ABB2BF',
      token: 'source.cs keyword.operator',
    },
    {
      foreground: '#ABB2BF',
      token: 'variable.other.readwrite.cs',
    },
    {
      foreground: '#ABB2BF',
      token: 'variable.other.object.cs',
    },
    {
      foreground: '#ABB2BF',
      token: 'variable.other.object.property.cs',
    },
    {
      foreground: '#61AFEF',
      token: 'entity.name.variable.property.cs',
    },
    {
      foreground: '#E5C07B',
      token: 'storage.type.cs',
    },
    {
      foreground: '#E06C75',
      token: 'keyword.other.unsafe.rust',
    },
    {
      foreground: '#ABB2BF',
      token: 'markup.raw.block.markdown',
    },
    {
      foreground: '#E06C75',
      token: 'punctuation.definition.variable.shell',
    },
    {
      foreground: '#ABB2BF',
      token: 'support.constant.property-value.css',
    },
    {
      foreground: '#D19A66',
      token: 'punctuation.definition.constant.css',
    },
    {
      foreground: '#E06C75',
      token: 'punctuation.separator.key-value.scss',
    },
    {
      foreground: '#D19A66',
      token: 'punctuation.definition.constant.scss',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.property-list.scss punctuation.separator.key-value.scss',
    },
    {
      foreground: '#E5C07B',
      token: 'storage.type.primitive.array.java',
    },
    {
      foreground: '#E06C75',
      token: 'entity.name.section.markdown',
    },
    {
      foreground: '#E06C75',
      token: 'punctuation.definition.heading.markdown',
    },
    {
      foreground: '#ABB2BF',
      token: 'markup.heading.setext',
    },
    {
      foreground: '#D19A66',
      token: 'punctuation.definition.bold.markdown',
    },
    {
      foreground: '#98C379',
      token: 'markup.inline.raw.markdown',
    },
    {
      foreground: '#E06C75',
      token: 'beginning.punctuation.definition.list.markdown',
    },
    {
      foreground: '#5C6370',
      fontStyle: 'italic',
      token: 'markup.quote.markdown',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.string.begin.markdown',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.string.end.markdown',
    },
    {
      foreground: '#ABB2BF',
      token: 'punctuation.definition.metadata.markdown',
    },
    {
      foreground: '#C678DD',
      token: 'punctuation.definition.metadata.markdown',
    },
    {
      foreground: '#C678DD',
      token: 'markup.underline.link.markdown',
    },
    {
      foreground: '#C678DD',
      token: 'markup.underline.link.image.markdown',
    },
    {
      foreground: '#61AFEF',
      token: 'string.other.link.title.markdown',
    },
    {
      foreground: '#61AFEF',
      token: 'string.other.link.description.markdown',
    },
    {
      foreground: '#E06C75',
      token: 'punctuation.separator.variable.ruby',
    },
    {
      foreground: '#D19A66',
      token: 'variable.other.constant.ruby',
    },
    {
      foreground: '#98C379',
      token: 'keyword.operator.other.ruby',
    },
    {
      foreground: '#E06C75',
      token: 'punctuation.definition.variable.php',
    },
    {
      foreground: '#ABB2BF',
      token: 'meta.class.php',
    },
    {
      foreground: '#6796E6',
      token: 'token.info-token',
    },
    {
      foreground: '#CD9731',
      token: 'token.warn-token',
    },
    {
      foreground: '#F44747',
      token: 'token.error-token',
    },
    {
      foreground: '#B267E6',
      token: 'token.debug-token',
    },
  ],
  encodedTokensColors: [],
};

export { cristataCodeDarkTheme };
