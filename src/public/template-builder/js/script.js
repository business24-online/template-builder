/**
 * Form Builder from Schema
 * ========================
 *
 * Builds an HTML form from a normalized schema array.
 * Each schema item has:
 *   { _id, property: "input_field"|"view_field"|"group", key, type, el_attrs, fields, repeatable, layout }
 *
 * Usage:
 *   renderFormPreview(schema, repeatInstances, options) => HTML string
 *   renderFormField(field, namePrefix)                  => HTML string
 *
 * The schema is a normalized array (not the raw disk format).
 * See the builder docs for schema structure details.
 *
 * Form Data Persistence:
 *   initFormPersistence(containerEl, schema)  — sets up auto-save on input changes
 *   collectFormData(rootEl)                   — returns nested JSON from form fields
 *   applyFormData(rootEl, data)               — populates fields from nested or flat data
 *   saveFormData(rootEl)                      — collects and POSTs to /template-builder/formdata
 *   loadFormData(callback)                    — GETs from /template-builder/formdata
 */

;(function () {
  'use strict'

  /**
   * ────────────────────────────────────────────────────────────────────────────
   * renderFormField
   * ────────────────────────────────────────────────────────────────────────────
   *
   * Converts a single schema field into an HTML form element.
   *
   * The `name` attribute is built from the field's key and an optional
   * namePrefix. For nested fields, pass the parent container path so the
   * resulting name matches the Form Read Property notation:
   *
   *   Root field:           name="first_name"
   *   Nested in container:  name="contact.first_name"
   *   In repeatable [i]:    name="skills[0].name"
   *
   * @param {Object} field        Schema item (non-group)
   * @param {string} [namePrefix] Parent path prefix (e.g. "contact." or "skills[0].")
   * @returns {string}            HTML string
   */
  window.renderFormField = function renderFormField(field, namePrefix) {
    var s = field.el_attrs?.style || ''
    var cls = field.el_attrs?.className ? ' class="' + field.el_attrs.className + '"' : ''
    var idAttr = field.el_attrs?.id ? ' id="' + field.el_attrs.id + '"' : ''
    var name = (namePrefix || '') + field.key
    var nameAttr = ' name="' + name + '"'
    var attrs = cls + idAttr + nameAttr

    switch (field.type) {
      // ── Text & String Inputs ──────────────────────────────────────────
      case 'text':
        return '<input type="text"' + attrs + ' placeholder="' + (field.el_attrs?.placeholder || '') + '" value="' + (field.el_attrs?.default || '') + '" ' + (field.el_attrs?.disabled ? 'disabled' : '') + ' ' + (field.el_attrs?.readonly ? 'readonly' : '') + ' style="' + s + '">'

      case 'email':
        return '<input type="email"' + attrs + ' placeholder="' + (field.el_attrs?.placeholder || '') + '" value="' + (field.el_attrs?.default || '') + '" style="' + s + '">'

      case 'url':
        return '<input type="url"' + attrs + ' placeholder="' + (field.el_attrs?.placeholder || '') + '" value="' + (field.el_attrs?.default || '') + '" style="' + s + '">'

      case 'tel':
        return '<input type="tel"' + attrs + ' placeholder="' + (field.el_attrs?.placeholder || '') + '" value="' + (field.el_attrs?.default || '') + '" style="' + s + '">'

      // ── Number & Date ─────────────────────────────────────────────────
      case 'number':
        return '<input type="number"' + attrs + ' placeholder="' + (field.el_attrs?.placeholder || '') + '" value="' + (field.el_attrs?.default || '') + '" min="' + (field.el_attrs?.min || '') + '" max="' + (field.el_attrs?.max || '') + '" step="' + (field.el_attrs?.step || '') + '" style="' + s + '">'

      case 'date':
        return '<input type="date"' + attrs + ' placeholder="' + (field.el_attrs?.placeholder || '') + '" value="' + (field.el_attrs?.default || '') + '" min="' + (field.el_attrs?.min || '') + '" max="' + (field.el_attrs?.max || '') + '" style="' + s + '">'

      // ── Textarea ──────────────────────────────────────────────────────
      case 'textarea':
        return '<textarea' + attrs + ' placeholder="' + (field.el_attrs?.placeholder || '') + '" rows="' + (field.el_attrs?.rows || '') + '" cols="' + (field.el_attrs?.cols || '') + '" style="' + s + '">' + (field.el_attrs?.default || '') + '</textarea>'

      // ── Select / Dropdown ─────────────────────────────────────────────
      case 'select': {
        var opts = field.el_attrs?.options || []
        var noneOpt = field.el_attrs?.required ? '' : '<option value="" selected>———</option>'
        var ph = field.el_attrs?.placeholder ? '<option>' + field.el_attrs.placeholder + '</option>' : ''
        var options = opts.map(function (o) {
          return '<option>' + (typeof o === 'object' ? o.label || o.value || '' : o) + '</option>'
        }).join('')
        return '<select' + attrs + ' style="' + s + '">' + noneOpt + ph + options + '</select>'
      }

      // ── File / Image Upload ───────────────────────────────────────────
      case 'file':
        return '<div style="display:flex;flex-direction:column;gap:4px">' +
          '<input type="file" data-file-upload="' + name + '" accept="' + (field.el_attrs?.accept || '') + '" ' + (field.el_attrs?.multiple ? 'multiple' : '') + ' class="template-input-file" style="' + s + '">' +
          '<input type="hidden" name="' + name + '" value="">' +
          '<span class="template-file-name" data-file-name="' + name + '"></span>' +
          '</div>'

      case 'image':
        return '<div style="display:flex;flex-direction:column;gap:4px">' +
          '<input type="file" data-file-upload="' + name + '" accept="image/*"' + ' class="template-input-file" style="' + s + '">' +
          '<input type="hidden" name="' + name + '" value="">' +
          '<img data-file-preview="' + name + '" class="template-file-preview" style="display:none">' +
          '</div>'

      // ── Color Picker ──────────────────────────────────────────────────
      case 'color':
        return '<input type="color"' + attrs + ' value="' + (field.el_attrs?.default || '#000000') + '" style="' + s + '">'

      // ── View / Display Fields (read-only presentation) ────────────────
      case 'label':
        return '<div' + attrs + ' style="' + s + '">' + (field.el_attrs?.content || field.key || 'Label') + '</div>'

      case 'paragraph':
        return '<p' + attrs + ' style="' + s + '">' + (field.el_attrs?.content || field.key || 'Paragraph') + '</p>'

      case 'img':
        return '<img' + attrs + ' src="' + (field.el_attrs?.content || '') + '" alt="' + (field.el_attrs?.alt || '') + '" style="' + s + '" onerror="if(!this.src||this.src===location.href)return;this.style.display=\'none\'">'

      default:
        return ''
    }
  }

  /**
   * ────────────────────────────────────────────────────────────────────────────
   * renderGroup (internal)
   * ────────────────────────────────────────────────────────────────────────────
   *
   * Renders a container/group to HTML. Recursively renders children and
   * passes the dotted path prefix so each field's `name` reflects its
   * full location in the schema tree.
   *
   * @param {Object} item        Schema item with property === "group"
   * @param {string} prefix      Path prefix to reach this container (excludes item.key)
   * @returns {string}           HTML string
   */
  function renderGroup(item, prefix) {
    var childPrefix = (prefix || '') + item.key + '.'
    var fields = renderFields(item.fields || [], childPrefix)
    var cls = item.el_attrs?.className ? ' class="' + item.el_attrs.className + '"' : ''
    var sty = item.el_attrs?.style ? ' style="' + item.el_attrs.style + '"' : ''
    return '<div' + cls + sty + '>' + fields + '</div>'
  }

  /**
   * Renders a list of child fields with a shared name prefix.
   * Used by both static and repeatable containers.
   *
   * @param {Object[]} fields   Array of schema items
   * @param {string}   prefix   Name prefix for all children
   * @returns {string}          HTML string
   */
  function renderFields(fields, prefix) {
    return fields.map(function (f) {
      if (f.property === 'group') return renderGroup(f, prefix)
      return renderFormField(f, prefix)
    }).join('')
  }

  /**
   * ────────────────────────────────────────────────────────────────────────────
   * renderFormPreview
   * ────────────────────────────────────────────────────────────────────────────
   *
   * Renders the full form from a normalized schema array.
   * Field `name` attributes use dotted paths matching Form Read Property.
   *
   * @param {Object[]} schema                  Array of schema items (normalized)
   * @param {Object}   [repeatInstances]       Map of _id → instance count
   * @param {Object}   [options]               Rendering options
   * @param {boolean}  [options.editable]      Show add/remove buttons for repeatables
   * @returns {string}  HTML string of the form
   */
  window.renderFormPreview = function renderFormPreview(schema, repeatInstances, options) {
    if (!repeatInstances) repeatInstances = {}
    if (!options) options = {}
    var editable = options.editable || false

    var items = schema.map(function (item) {
      // Non-group: render as a single field (root-level, no prefix)
      if (item.property !== 'group') return renderFormField(item)

      // Repeatable container — render N instances, each with indexed prefix
      if (item.repeatable) {
        var count = repeatInstances[item._id] || 0
        var groups = ''
        for (var i = 0; i < count; i++) {
          var instancePrefix = item.key + '[' + i + '].'
          var f = renderFields(item.fields || [], instancePrefix)
          var innerCls = item.el_attrs?.className ? ' class="' + item.el_attrs.className + '"' : ''
          var innerSty = item.el_attrs?.style ? ' style="' + item.el_attrs.style + '"' : ''
          var inner = '<div' + innerCls + innerSty + '>' + f + '</div>'
          var removeBtn = editable
            ? '<button data-action="remove-repeat" data-id="' + item._id + '" data-key="' + item.key + '" data-index="' + i + '" class="text-xs px-2 py-1 bg-red-50 text-red-500 border border-red-200 rounded hover:bg-red-100 transition-colors">Remove</button>'
            : ''
          groups += '<div style="position:relative;padding:12px;margin-bottom:8px;border:1px dashed #d1d5db;border-radius:8px">' + removeBtn + inner + '</div>'
        }
        var addBtn = editable
          ? '<button data-action="add-repeat" data-id="' + item._id + '" class="mt-1 w-full py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-dashed border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">+ Add</button>'
          : ''
        return groups + addBtn
      }

      // Static container — pass its key as prefix
      return renderGroup(item, '')
    }).join('')

    return '<div class="flex-1 p-4 overflow-auto"><div>' + items + '</div></div>'
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FORM DATA PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Parses a dotted path like "contact.first_name" or "skills[0].name"
   * into segments: [{key:"contact"}, {key:"first_name"}] or
   * [{key:"skills", index:0}, {key:"name"}].
   */
  function parsePath(name) {
    var segs = []
    var buf = ''
    for (var i = 0; i < name.length; i++) {
      var ch = name[i]
      if (ch === '.') {
        if (buf) { segs.push(buf); buf = '' }
      } else {
        buf += ch
      }
    }
    if (buf) segs.push(buf)

    return segs.map(function (seg) {
      var bracket = seg.indexOf('[')
      if (bracket !== -1) {
        return {
          key: seg.substring(0, bracket),
          index: parseInt(seg.substring(bracket + 1, seg.indexOf(']')), 10)
        }
      }
      return { key: seg }
    })
  }

  /**
   * Collects all form field values from a container into a nested
   * JSON object. The `name` attributes use dotted paths which are
   * parsed to build the nested structure directly.
   *
   *   name="container.first_name"   →  { container: { first_name: "..." } }
   *   name="skills[0].name"         →  { skills: [{ name: "..." }] }
   *
   * @param {Element} rootEl  DOM element containing the form fields
   * @returns {Object}        Nested JSON object
   */
  window.collectFormData = function collectFormData(rootEl) {
    var result = {}
    var els = rootEl.querySelectorAll('[name]')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      if (!el.name) continue
      if (el.type === 'file') continue

      var value
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (!el.checked) continue
        value = el.value
      } else {
        value = el.value
      }

      var segs = parsePath(el.name)
      var current = result
      for (var s = 0; s < segs.length; s++) {
        var seg = segs[s]
        var isLast = s === segs.length - 1

        if (seg.index !== undefined) {
          // Array segment: ensure array exists
          if (!current[seg.key]) current[seg.key] = []
          var arr = current[seg.key]
          if (isLast) {
            arr[seg.index] = value
          } else {
            if (!arr[seg.index]) arr[seg.index] = {}
            current = arr[seg.index]
          }
        } else {
          if (isLast) {
            current[seg.key] = value
          } else {
            if (!current[seg.key]) current[seg.key] = {}
            current = current[seg.key]
          }
        }
      }
    }
    return result
  }

  /**
   * Applies a saved form data object back into the DOM,
   * walking the nested structure to find values for each field.
   *
   * Accepts both nested format (from saveFormData) and flat format
   * (legacy { "path.key": value }).
   *
   * @param {Element} rootEl  DOM element containing the form fields
   * @param {Object}  data    Nested or flat form data object
   */
  window.applyFormData = function applyFormData(rootEl, data) {
    if (!data) return
    var els = rootEl.querySelectorAll('[name]')
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      if (!el.name) continue

      // Try nested lookup first
      var segs = parsePath(el.name)
      var val = data
      var found = true
      var lastPrimitive = undefined
      for (var s = 0; s < segs.length; s++) {
        var seg = segs[s]
        if (seg.index !== undefined) {
          if (!val || typeof val !== 'object' || !Array.isArray(val[seg.key])) { found = false; break }
          var arr = val[seg.key]
          if (seg.index >= arr.length) { found = false; break }
          val = arr[seg.index]
          if (typeof val !== 'object' && val !== null) {
            lastPrimitive = val
          }
        } else {
          if (val === null || typeof val !== 'object' || !(seg.key in val)) {
            // If the previous step gave us a primitive from an array, it's the
            // actual value — the extra key is a schema field name for a single-field
            // repeatable group (e.g. data has flat strings, but field is skills[0].skill)
            if (lastPrimitive !== undefined) { val = lastPrimitive; found = true }
            else { found = false }
            break
          }
          val = val[seg.key]
          lastPrimitive = undefined
        }
      }

      // Fallback to flat lookup
      if (!found) {
        if (!(el.name in data)) continue
        val = data[el.name]
      }

      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = String(val) === el.value
      } else {
        el.value = val
      }

      // Show image/file preview when a hidden input gets a saved path
      if (el.type === 'hidden' && val && typeof val === 'string') {
        var preview = rootEl.querySelector('[data-file-preview="' + el.name + '"]')
        if (preview) {
          preview.src = val
          preview.style.display = ''
        }
        var fileName = rootEl.querySelector('[data-file-name="' + el.name + '"]')
        if (fileName) {
          fileName.textContent = val.split('/').pop()
        }
      }
    }
  }

  /**
   * Converts flat dot-notation form data into a nested structure.
   *
   *   "container.first_name"  →  { container: { first_name: "..." } }
   *   "skills[0].name"        →  { skills: [{ name: "..." }] }
   *   "skills[1].name"        →  { skills: [{ name: "..." }, { name: "..." }] }
   *
   * @param {Object} flat  { "path.key": value, ... }
   * @returns {Object}      Nested JSON object
   */
  window.expandFormData = function expandFormData(flat) {
    var result = {}

    for (var flatKey in flat) {
      if (!Object.prototype.hasOwnProperty.call(flat, flatKey)) continue
      var value = flat[flatKey]

      // Parse segments: split by '.' keeping array indices intact
      var segs = []
      var buf = ''
      for (var k = 0; k < flatKey.length; k++) {
        var ch = flatKey[k]
        if (ch === '.') {
          if (buf) segs.push(buf)
          buf = ''
        } else {
          buf += ch
        }
      }
      if (buf) segs.push(buf)

      // Walk segments and build nested structure into result
      var current = result
      for (var s = 0; s < segs.length; s++) {
        var seg = segs[s]
        var isLast = s === segs.length - 1

        // Does this segment have an array index? e.g. "skills[0]"
        var bracketIdx = seg.indexOf('[')
        if (bracketIdx !== -1) {
          var arrName = seg.substring(0, bracketIdx)
          var arrIdx = parseInt(seg.substring(bracketIdx + 1, seg.indexOf(']')), 10)

          if (!current[arrName]) current[arrName] = []
          var arr = current[arrName]

          if (isLast) {
            arr[arrIdx] = value
          } else {
            if (!arr[arrIdx]) arr[arrIdx] = {}
            current = arr[arrIdx]
          }
        } else {
          if (isLast) {
            current[seg] = value
          } else {
            if (!current[seg]) current[seg] = {}
            current = current[seg]
          }
        }
      }
    }

    return result
  }

  /**
   * Saves the current form data to the server at
   * POST /template-builder/formdata.
   *
   * The data is collected as nested JSON directly
   * (no intermediate flat step).
   *
   * @param {Element} rootEl  DOM element containing the form fields
   * @returns {Promise}        Resolves when save completes
   */
  window.saveFormData = function saveFormData(rootEl) {
    var data = collectFormData(rootEl)
    return fetch('/template-builder/formdata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }

  /**
   * Loads saved form data from the server at
   * GET /template-builder/api/formdata.
   *
   * @param {Function} callback  Receives (err, data) where data is the
   *                             parsed form data object or null
   */
  window.loadFormData = function loadFormData(callback) {
    fetch('/template-builder/formdata')
      .then(function (r) {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(function (data) { callback(null, data) })
      .catch(function () { callback(null, null) })
  }

  /**
   * Uploads a file to the server and updates the corresponding hidden input.
   * Shows the uploaded filename or image preview on completion.
   */
  function handleFileUpload(input, rootEl) {
    var file = input.files && input.files[0]
    if (!file) return
    var name = input.getAttribute('data-file-upload')
    var fd = new FormData()
    fd.append('file', file)
    fetch('/template-builder/upload', { method: 'POST', body: fd })
      .then(function (r) { return r.json() })
      .then(function (data) {
        var hidden = rootEl.querySelector('input[type="hidden"][name="' + name + '"]')
        if (hidden) hidden.value = data.path
        var fileNameEl = rootEl.querySelector('[data-file-name="' + name + '"]')
        if (fileNameEl) fileNameEl.textContent = file.name
        var previewEl = rootEl.querySelector('[data-file-preview="' + name + '"]')
        if (previewEl) {
          var isImage = file.type.startsWith('image/')
          if (isImage && data.path) {
            previewEl.src = data.path
            previewEl.style.display = ''
          }
        }
        saveFormData(rootEl)
      })
      .catch(function () {
        var fileNameEl = rootEl.querySelector('[data-file-name="' + name + '"]')
        if (fileNameEl) fileNameEl.textContent = 'Upload failed'
      })
  }

  /**
   * Initialises auto-save on the form preview.
   *
   * 1. Loads previously saved form data.
   * 2. If repeatable containers have saved instances, sets instance counts
   *    via the provided callback (triggers re-render with instances shown).
   * 3. Applies saved values to the DOM fields.
   * 4. Listens for input/change events and auto-saves on every change
   *    (with a 300 ms debounce).
   *
   * @param {Element}   rootEl                The DOM element holding the rendered form
   * @param {Object[]}  schema                Normalized schema array
   * @param {Object}    [currentCounts]       Current repeatInstances map { _id: count }
   * @param {Function}  [setRepeatInstances]  Called with { _id: count, ... }
   *                                          when repeat counts need updating.
   *                                          The caller should mutate its store.
   */
  window.initFormPersistence = function initFormPersistence(rootEl, schema, currentCounts, setRepeatInstances) {
    if (!rootEl) return

    // Use pending formdata (from remove handler) instead of fetching
    if (_pendingFormData) {
      var data = _pendingFormData
      _pendingFormData = null
      applyFormData(rootEl, data)
      return
    }

    loadFormData(function (err, data) {
      if (!data) return

      // ── Auto-detect repeatable instance counts from saved data ─────
      // Only runs once on initial load — subsequent add/remove is managed
      // by the builder UI and must not be overridden by saved data.
      if (!_initialRecountDone && setRepeatInstances && schema) {
        var counts = {}
        walkRepeatContainers(schema, '', function (_id, dataPath) {
          var val = data
          for (var i = 0; i < dataPath.length; i++) {
            if (!val || typeof val !== 'object') { val = undefined; break }
            val = val[dataPath[i]]
          }
          if (Array.isArray(val) && val.length > 0) {
            counts[_id] = val.length
          }
        })

        var needsUpdate = false
        for (var id in counts) {
          if (counts[id] !== ((currentCounts && currentCounts[id]) || 0)) {
            needsUpdate = true
            break
          }
        }

        if (needsUpdate) {
          setRepeatInstances(counts)
          // Bail out — re-render will call initFormPersistence again
          // with updated currentCounts, and this time needsUpdate
          // will be false, falling through to applyFormData below.
          return
        }

        // Only mark initial recount done when the schema actually has
        // repeatable containers. The initial render may have an empty
        // schema (still loading), and we must not block the subsequent
        // render that has the real schema from auto-detecting instances.
        if (Object.keys(counts).length > 0 || (schema && schema.length > 0)) {
          _initialRecountDone = true
        }
      }

      // ── Populate field values ──────────────────────────────────────
      applyFormData(rootEl, data)
    })

    // ── Auto-save on input/change ────────────────────────────────────
    var timer = null
    rootEl.addEventListener('input', function () {
      if (timer) clearTimeout(timer)
      timer = setTimeout(function () {
        saveFormData(rootEl)
      }, 300)
    })
    rootEl.addEventListener('change', function (e) {
      var fileInput = e.target.closest('[data-file-upload]')
      if (fileInput) {
        handleFileUpload(fileInput, rootEl)
        return
      }
      if (timer) clearTimeout(timer)
      saveFormData(rootEl)
    })
  }

  /**
   * Walks the schema tree to find all repeatable containers.
   * Calls callback(_id, dataPath) for each, where dataPath is an array
   * of keys to walk into the form data object.
   */
  var _initialRecountDone = false
  var _pendingFormData = null

  window.setPendingFormData = function (data) { _pendingFormData = data }

  window.resetRecountFlag = function () { _initialRecountDone = false }

  window.recountRepeatInstances = function (schema, data) {
    var counts = {}
    walkRepeatContainers(schema, '', function (_id, dataPath) {
      var val = data
      for (var i = 0; i < dataPath.length; i++) {
        if (!val || typeof val !== 'object') { val = undefined; break }
        val = val[dataPath[i]]
      }
      if (Array.isArray(val) && val.length > 0) {
        counts[_id] = val.length
      }
    })
    return counts
  }

  function walkRepeatContainers(items, prefix, fn) {
    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (item.property !== 'group') continue

      if (item.repeatable) {
        var dataPath = prefix ? prefix.split('.') : []
        dataPath.push(item.key)
        fn(item._id, dataPath)
      }

      var childPrefix = (prefix ? prefix + '.' : '') + item.key
      walkRepeatContainers(item.fields || [], childPrefix, fn)
    }
  }

})()
