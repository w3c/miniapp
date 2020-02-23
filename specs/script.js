void function() {

    var LANG_LIST = ['en', 'zh-hans']

    var L10N = {
        'en': {
        selector: {
          '#abstract-1': 'Abstract',
          '#h-sotd': 'Status of This Document',
          '#table-of-contents': 'Table of Contents',
          '.note-title': 'Note',
        },

        'fig': 'Fig. ',

        dt: {},

        dd: {
          'Bug tracker:': '<a href="https://github.com/w3c/miniapp/issues">file a bug</a> (<a href="https://github.com/w3c/miniapp/issues">open bugs</a>)',
        },
      },

      'zh-hans': {
        selector: {
          '#abstract-1': '摘要',
          '#h-sotd': '关于本文档',
          '#table-of-contents': '内容大纲',
          '.note-title': '注',
        },

        'fig': '图',

        dt: {
          'This version:': '本版本：',
          'Latest published version:': '最新发布草稿：',
          'Latest editor\'s draft:': '最新编辑草稿：',
          'Editors:': '编辑：',
          'Bug tracker:': '错误跟踪：',
          'GitHub:': 'GitHub：',
        },

        dd: {
          'Bug tracker:': '<a href="https://github.com/w3c/miniapp/issues">反馈错误</a>（<a href="https://github.com/w3c/miniapp/issues">修正中的错误</a>）',
        }
      },
    }

    var $root = document.documentElement
    var $$hidden = []

    function arrayify(obj) {
        return Array.from ? Array.from(obj) : Array.prototype.slice.call(obj)
    }

    function $(selector, context) {
      return (context || document).querySelector(selector)
    }

    function $$(selector, context) {
        return arrayify((context || document).querySelectorAll(selector))
    }

    function toggle$rootClass(lang) {
      $root.lang = lang === 'all' ? 'en' : lang

        if (lang === 'all') {
          $root.classList.add('is-multilingual')
          $root.classList.remove('isnt-multilingual')
        } else {
          $root.classList.remove('is-multilingual')
          $root.classList.add('isnt-multilingual')
        }
    }

    function showAndHideLang(lang) {
      // Show previously hidden parts:
      $$hidden
      .forEach(function($elmt) { Object.assign($elmt, { hidden: false }) })

      if (lang === 'all') {
          return
      }

      // Hide parts of other languages:
      $$hidden = (
        LANG_LIST
        .filter(function(it) { return it !== lang })
        .reduce(function(result, it) { return result.concat($$('[its-locale-filter-list="' + it + '"]')) }, [])
        .map(function($elmt) { return Object.assign($elmt, { hidden: true }) })
      )
    }

    function replaceBoilerplateText(lang) {
      var l10n = L10N[lang === 'all' ? 'en' : lang]

      // Alter some basic headings, etc:
      Object.keys(l10n.selector)
      .forEach(function(s) {
        $$(s)
        .forEach(function($elmt) {
            Object.assign($elmt, { textContent: l10n.selector[s] })
        })
      })

      $$('figcaption, .fig-ref')
      .forEach(function($elmt) {
          Object.assign($elmt.firstChild, { textContent: l10n['fig'] })
        })

      $$('h1 + h2 + dl dt')
      .forEach(function($dt) {
        var originalText = $dt.dataset.originalText || $dt.textContent
        var text = l10n.dt[originalText] || originalText

        if (text) {
          $dt.textContent = text
          $dt.dataset.originalText = originalText
        }

        if (originalText === 'Bug tracker:') {
          $dt.nextElementSibling.innerHTML = l10n.dd['Bug tracker:']
        }
      })
    }

    /**
     * Expose to global for now since respec will re-parse the entire document
     * and event bound will be lost.
     */
    window.switchLang = function(lang) {
      toggle$rootClass(lang)
      showAndHideLang(lang)
      replaceBoilerplateText(lang)
    }

    /**
     * Add `lang` attribute wherever there is a its-locale-filter-list attribute.
     * This is done by js to reduce burden on editors
     * If there's already a lang attribute in the tag, that tag is skipped.
     *
     * Note that this may still produce temporarily incorrect labelling
     * where text is awaiting translation.
     */
    function addLangAttr() {
      toggle$rootClass('all')

      LANG_LIST
      .forEach(function(lang) {
        $$('[its-locale-filter-list="' + lang + '"]')
        .forEach(function($elmt) {
          if (!$elmt.lang) {
            $elmt.lang = lang
          }
        })
      })
    }

    addLangAttr()
    }()
