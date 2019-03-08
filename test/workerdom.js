const self = {postMessage: () => {}};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const toLower = value => value.toLowerCase();
const toUpper = value => value.toUpperCase();
const containsIndexOf = pos => pos !== -1;
const keyValueString = (key, value) => `${key}="${value}"`;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const tagNameConditionPredicate = tagNames => element => {
  return tagNames.includes(element.tagName);
};
const elementPredicate = node => node.nodeType === 1
/* ELEMENT_NODE */
;
const matchChildrenElements = (node, conditionPredicate) => {
  const matchingElements = [];
  node.childNodes.forEach(child => {
    if (elementPredicate(child)) {
      if (conditionPredicate(child)) {
        matchingElements.push(child);
      }

      matchingElements.push(...matchChildrenElements(child, conditionPredicate));
    }
  });
  return matchingElements;
};
const matchChildElement = (element, conditionPredicate) => {
  let returnValue = null;
  element.children.some(child => {
    if (conditionPredicate(child)) {
      returnValue = child;
      return true;
    }

    const grandChildMatch = matchChildElement(child, conditionPredicate);

    if (grandChildMatch !== null) {
      returnValue = grandChildMatch;
      return true;
    }

    return false;
  });
  return returnValue;
};
const matchNearestParent = (element, conditionPredicate) => {
  while (element = element.parentNode) {
    if (conditionPredicate(element)) {
      return element;
    }
  }

  return null;
};
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
 * @param attrSelector the selector we are trying to match for.
 * @param element the element being tested.
 * @return boolean for whether we match the condition
 */

const matchAttrReference = (attrSelector, element) => {
  if (!attrSelector) {
    return false;
  }

  const equalPos = attrSelector.indexOf('=');
  const selectorLength = attrSelector.length;
  const caseInsensitive = attrSelector.charAt(selectorLength - 2) === 'i';
  let endPos = caseInsensitive ? selectorLength - 3 : selectorLength - 1;

  if (equalPos !== -1) {
    const equalSuffix = attrSelector.charAt(equalPos - 1);
    const possibleSuffixes = ['~', '|', '$', '^', '*'];
    const attrString = possibleSuffixes.includes(equalSuffix) ? attrSelector.substring(1, equalPos - 1) : attrSelector.substring(1, equalPos);
    const rawValue = attrSelector.substring(equalPos + 1, endPos);
    const rawAttrValue = element.getAttribute(attrString);

    if (rawAttrValue) {
      const casedValue = caseInsensitive ? toLower(rawValue) : rawValue;
      const casedAttrValue = caseInsensitive ? toLower(rawAttrValue) : rawAttrValue;

      switch (equalSuffix) {
        case '~':
          return casedAttrValue.split(' ').indexOf(casedValue) !== -1;

        case '|':
          return casedAttrValue === casedValue || casedAttrValue === `${casedValue}-`;

        case '^':
          return casedAttrValue.startsWith(casedValue);

        case '$':
          return casedAttrValue.endsWith(casedValue);

        case '*':
          return casedAttrValue.indexOf(casedValue) !== -1;

        default:
          return casedAttrValue === casedValue;
      }
    }

    return false;
  } else {
    return element.hasAttribute(attrSelector.substring(1, endPos));
  }
};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let phase = 0
/* Initializing */
;
const set = newPhase => phase = newPhase;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let count = 0;
let transfer = [];
const mapping = new Map();
/**
 * Stores a node in mapping, and makes the index available on the Node directly.
 * @param node Node to store and modify with index
 * @return index Node was stored with in mapping
 */

function store(node) {
  if (node[7
  /* index */
  ] !== undefined) {
    return node[7
    /* index */
    ];
  }

  mapping.set(node[7
  /* index */
  ] = ++count, node);

  if (phase !== 0
  /* Initializing */
  ) {
      // After Initialization, include all future dom node creation into the list for next transfer.
      transfer.push(node);
    }

  return count;
}
/**
 * Retrieves a node based on an index.
 * @param index location in map to retrieve a Node for
 * @return either the Node represented in index position, or null if not available.
 */

function get(index) {
  // mapping has a 1 based index, since on first store we ++count before storing.
  return !!index && mapping.get(index) || null;
}
/**
 * Returns nodes registered but not yet transferred.
 * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
 */

function consume() {
  const copy = transfer;
  transfer = [];
  return copy;
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a;

const observers = [];
let pendingMutations = false;

const match = (observerTarget, target) => observerTarget !== null && target[7
/* index */
] === observerTarget[7
/* index */
];

const pushMutation = (observer, record) => {
  observer.pushRecord(record);

  if (!pendingMutations) {
    pendingMutations = true;
    Promise.resolve().then(() => {
      pendingMutations = false;
      observers.forEach(observer => observer.callback(observer.takeRecords()));
    });
  }
};
/**
 * When DOM mutations occur, Nodes will call this method with MutationRecords
 * These records are then pushed into MutationObserver instances that match the MutationRecord.target
 * @param record MutationRecord to push into MutationObservers.
 */


function mutate(record) {
  observers.forEach(observer => {
    if (!observer.options.flatten) {
      // TODO: Restore? || record.type === MutationRecordType.COMMAND
      pushMutation(observer, record);
      return;
    }

    let target = record.target;
    let matched = match(observer.target, target);

    if (!matched) {
      do {
        if (matched = match(observer.target, target)) {
          pushMutation(observer, record);
          break;
        }
      } while (target = target.parentNode);
    }
  });
}
class MutationObserver {
  constructor(callback) {
    this[_a] = [];
    this.callback = callback;
  }
  /**
   * Register the MutationObserver instance to observe a Nodes mutations.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
   * @param target Node to observe DOM mutations
   */


  observe(target, options) {
    this.disconnect();
    this.target = target;
    this.options = Object.assign({
      flatten: false
    }, options);
    observers.push(this);
  }
  /**
   * Stop the MutationObserver instance from observing a Nodes mutations.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
   */


  disconnect() {
    this.target = null;
    const index = observers.indexOf(this);

    if (index >= 0) {
      observers.splice(index, 1);
    }
  }
  /**
   * Empties the MutationObserver instance's record queue and returns what was in there.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
   * @return Mutation Records stored on this MutationObserver instance.
   */


  takeRecords() {
    return this[42
    /* records */
    ].splice(0, this[42
    /* records */
    ].length);
  }
  /**
   * NOTE: This method doesn't exist on native MutationObserver.
   * @param record MutationRecord to store for this instance.
   */


  pushRecord(record) {
    this[42
    /* records */
    ].push(record);
  }

}
_a = 42
/* records */
;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let count$1 = 0;
let transfer$1 = [];
const mapping$1 = new Map();
/**
 * Stores a string in mapping and returns the index of the location.
 * @param value string to store
 * @return location in map
 */

function store$1(value) {
  if (mapping$1.has(value)) {
    // Safe to cast since we verified the mapping contains the value
    return mapping$1.get(value);
  }

  mapping$1.set(value, count$1);
  transfer$1.push(value);
  return count$1++;
}
/**
 * Returns strings registered but not yet transferred.
 * Side effect: Resets the transfer array to default value, to prevent passing the same values multiple times.
 */

function consume$1() {
  const strings = transfer$1;
  transfer$1 = [];
  return strings;
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$1;
/**
 * Propagates a property change for a Node to itself and all childNodes.
 * @param node Node to start applying change to
 * @param property Property to modify
 * @param value New value to apply
 */

const propagate = (node, property, value) => {
  node[property] = value;
  node.childNodes.forEach(child => propagate(child, property, value));
}; // https://developer.mozilla.org/en-US/docs/Web/API/Node
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
//
// Please note, in this implmentation Node doesn't extend EventTarget.
// This is intentional to reduce the number of classes.

class Node {
  constructor(nodeType, nodeName, ownerDocument) {
    this.childNodes = [];
    this.parentNode = null;
    this.isConnected = false;
    this[_a$1] = {};
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this.ownerDocument = ownerDocument || this;
    this[45
    /* scopingRoot */
    ] = this;
    this[7
    /* index */
    ] = store(this);
    this[9
    /* transferredFormat */
    ] = {
      [7
      /* index */
      ]: this[7
      /* index */
      ],
      [11
      /* transferred */
      ]: 1
      /* TRUE */

    };
  }
  /**
   * When hydrating the tree, we need to send HydrateableNode representations
   * for the main thread to process and store items from for future modifications.
   */


  hydrate() {
    return this[8
    /* creationFormat */
    ];
  } // Unimplemented Properties
  // Node.baseURI – https://developer.mozilla.org/en-US/docs/Web/API/Node/baseURI
  // Unimplemented Methods
  // Node.compareDocumentPosition() – https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
  // Node.getRootNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode
  // Node.isDefaultNamespace() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isDefaultNamespace
  // Node.isEqualNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode
  // Node.isSameNode() – https://developer.mozilla.org/en-US/docs/Web/API/Node/isSameNode
  // Node.lookupPrefix() – https://developer.mozilla.org/en-US/docs/Web/API/Node/lookupPrefix
  // Node.lookupNamespaceURI() – https://developer.mozilla.org/en-US/docs/Web/API/Node/lookupNamespaceURI
  // Node.normalize() – https://developer.mozilla.org/en-US/docs/Web/API/Node/normalize
  // Implemented at Element/Text layer
  // Node.nodeValue – https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue
  // Node.cloneNode – https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode

  /**
   * Getter returning the text representation of Element.childNodes.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
   * @return text from all childNodes.
   */


  get textContent() {
    return this.getTextContent();
  }
  /**
   * Use `this.getTextContent()` instead of `super.textContent` to avoid incorrect or expensive ES5 transpilation.
   */


  getTextContent() {
    let textContent = '';
    const childNodes = this.childNodes;

    if (childNodes.length) {
      childNodes.forEach(childNode => textContent += childNode.textContent);
      return textContent;
    }

    return '';
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild
   * @return Node's first child in the tree, or null if the node has no children.
   */


  get firstChild() {
    return this.childNodes[0] || null;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/lastChild
   * @return The last child of a node, or null if there are no child elements.
   */


  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling
   * @return node immediately following the specified one in it's parent's childNodes, or null if one doesn't exist.
   */


  get nextSibling() {
    if (this.parentNode === null) {
      return null;
    }

    const parentChildNodes = this.parentNode.childNodes;
    return parentChildNodes[parentChildNodes.indexOf(this) + 1] || null;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/previousSibling
   * @return node immediately preceding the specified one in its parent's childNodes, or null if the specified node is the first in that list.
   */


  get previousSibling() {
    if (this.parentNode === null) {
      return null;
    }

    const parentChildNodes = this.parentNode.childNodes;
    return parentChildNodes[parentChildNodes.indexOf(this) - 1] || null;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/hasChildNodes
   * @return boolean if the Node has childNodes.
   */


  hasChildNodes() {
    return this.childNodes.length > 0;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
   * @param otherNode
   * @return whether a Node is a descendant of a given Node
   */


  contains(otherNode) {
    if (otherNode === this) {
      return true;
    }

    if (this.childNodes.length > 0) {
      if (this.childNodes.includes(this)) {
        return true;
      }

      return this.childNodes.some(child => child.contains(otherNode));
    }

    return false;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
   * @param child
   * @param referenceNode
   * @return child after it has been inserted.
   */


  insertBefore(child, referenceNode) {
    if (child === null || child === this) {
      // The new child cannot contain the parent.
      return child;
    }

    if (child.nodeType === 11
    /* DOCUMENT_FRAGMENT_NODE */
    ) {
        child.childNodes.slice().forEach(node => this.insertBefore(node, referenceNode));
      } else if (referenceNode == null) {
      // When a referenceNode is not valid, appendChild(child).
      return this.appendChild(child);
    } else if (this.childNodes.indexOf(referenceNode) >= 0) {
      // Should only insertBefore direct children of this Node.
      child.remove(); // Removing a child can cause this.childNodes to change, meaning we need to splice from its updated location.

      this.childNodes.splice(this.childNodes.indexOf(referenceNode), 0, child);
      child.parentNode = this;
      propagate(child, 'isConnected', this.isConnected);
      propagate(child, 45
      /* scopingRoot */
      , this[45
      /* scopingRoot */
      ]);
      mutate({
        addedNodes: [child],
        nextSibling: referenceNode,
        type: 2
        /* CHILD_LIST */
        ,
        target: this
      });
      return child;
    }

    return null;
  }
  /**
   * Adds the specified childNode argument as the last child to the current node.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
   * @param child Child Node to append to this Node.
   * @return Node the appended node.
   */


  appendChild(child) {
    if (child.nodeType === 11
    /* DOCUMENT_FRAGMENT_NODE */
    ) {
        child.childNodes.slice().forEach(this.appendChild, this);
      } else {
      child.remove();
      child.parentNode = this;
      propagate(child, 'isConnected', this.isConnected);
      propagate(child, 45
      /* scopingRoot */
      , this[45
      /* scopingRoot */
      ]);
      this.childNodes.push(child);
      mutate({
        addedNodes: [child],
        previousSibling: this.childNodes[this.childNodes.length - 2],
        type: 2
        /* CHILD_LIST */
        ,
        target: this
      });
    }

    return child;
  }
  /**
   * Removes a child node from the current element.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
   * @param child Child Node to remove from this Node.
   * @return Node removed from the tree or null if the node wasn't attached to this tree.
   */


  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    const exists = index >= 0;

    if (exists) {
      child.parentNode = null;
      propagate(child, 'isConnected', false);
      propagate(child, 45
      /* scopingRoot */
      , child);
      this.childNodes.splice(index, 1);
      mutate({
        removedNodes: [child],
        type: 2
        /* CHILD_LIST */
        ,
        target: this
      });
      return child;
    }

    return null;
  }
  /**
   * @param newChild
   * @param oldChild
   * @return child that was replaced.
   * @note `HierarchyRequestError` not handled e.g. newChild is an ancestor of current node.
   * @see https://dom.spec.whatwg.org/#concept-node-replace
   */


  replaceChild(newChild, oldChild) {
    if (newChild === oldChild) {
      return oldChild;
    }

    if (oldChild.parentNode !== this) {
      // In DOM, this throws DOMException: "The node to be replaced is not a child of this node."
      return oldChild;
    }

    if (newChild.contains(this)) {
      // In DOM, this throws DOMException: "The new child element contains the parent."
      return oldChild;
    } // If newChild already exists in the DOM, it is first removed.


    newChild.remove();
    oldChild.parentNode = null;
    propagate(oldChild, 'isConnected', false);
    propagate(oldChild, 45
    /* scopingRoot */
    , oldChild);
    const index = this.childNodes.indexOf(oldChild);
    this.childNodes.splice(index, 1, newChild);
    newChild.parentNode = this;
    propagate(newChild, 'isConnected', this.isConnected);
    propagate(newChild, 45
    /* scopingRoot */
    , this[45
    /* scopingRoot */
    ]);
    mutate({
      addedNodes: [newChild],
      removedNodes: [oldChild],
      type: 2
      /* CHILD_LIST */
      ,
      nextSibling: this.childNodes[index + 1],
      target: this
    });
    return oldChild;
  }
  /**
   * Removes this Node from the tree it belogs too.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
   */


  remove() {
    this.parentNode && this.parentNode.removeChild(this);
  }
  /**
   * Add an event listener to callback when a specific event type is dispatched.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   * @param type Event Type (i.e 'click')
   * @param handler Function called when event is dispatched.
   */


  addEventListener(type, handler) {
    const handlers = this[10
    /* handlers */
    ][toLower(type)];
    let index = 0;

    if (handlers) {
      index = handlers.push(handler);
    } else {
      this[10
      /* handlers */
      ][toLower(type)] = [handler];
    }

    mutate({
      target: this,
      type: 4
      /* EVENT_SUBSCRIPTION */
      ,
      addedEvents: [{
        [12
        /* type */
        ]: store$1(type),
        [7
        /* index */
        ]: this[7
        /* index */
        ],
        [7
        /* index */
        ]: index
      }]
    });
  }
  /**
   * Remove a registered event listener for a specific event type.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
   * @param type Event Type (i.e 'click')
   * @param handler Function to stop calling when event is dispatched.
   */


  removeEventListener(type, handler) {
    const handlers = this[10
    /* handlers */
    ][toLower(type)];
    const index = !!handlers ? handlers.indexOf(handler) : -1;

    if (index >= 0) {
      handlers.splice(index, 1);
      mutate({
        target: this,
        type: 4
        /* EVENT_SUBSCRIPTION */
        ,
        removedEvents: [{
          [12
          /* type */
          ]: store$1(type),
          [7
          /* index */
          ]: this[7
          /* index */
          ],
          [7
          /* index */
          ]: index
        }]
      });
    }
  }
  /**
   * Dispatch an event for this Node.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
   * @param event Event to dispatch to this node and potentially cascade to parents.
   */


  dispatchEvent(event) {
    let target = event.currentTarget = this;
    let handlers;
    let iterator;

    do {
      handlers = target && target[10
      /* handlers */
      ] && target[10
      /* handlers */
      ][toLower(event.type)];

      if (handlers) {
        for (iterator = handlers.length; iterator--;) {
          if ((handlers[iterator].call(target, event) === false || event[51
          /* end */
          ]) && event.cancelable) {
            break;
          }
        }
      }
    } while (event.bubbles && !(event.cancelable && event[50
    /* stop */
    ]) && (target = target && target.parentNode));

    return !event.defaultPrevented;
  }

}
_a$1 = 10
/* handlers */
;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
Normally ParentNode is implemented as a mixin, but since the Node class is an abstract
this makes it hard to build a mixin that recieves a base of the representations of Node needing
the mixed in functionality.

// Partially implemented Mixin Methods
// Both Element.querySelector() and Element.querySelector() are only implemented for the following simple selectors:
// - Element selectors
// - ID selectors
// - Class selectors
// - Attribute selectors
// Element.querySelector() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
// Element.querySelectorAll() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
*/

class ParentNode extends Node {
  /**
   * Getter returning children of an Element that are Elements themselves.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
   * @return Element objects that are children of this ParentNode, omitting all of its non-element nodes.
   */
  get children() {
    return this.childNodes.filter(elementPredicate);
  }
  /**
   * Getter returning the number of child elements of a Element.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/childElementCount
   * @return number of child elements of the given Element.
   */


  get childElementCount() {
    return this.children.length;
  }
  /**
   * Getter returning the first Element in Element.childNodes.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/firstElementChild
   * @return first childNode that is also an element.
   */


  get firstElementChild() {
    return this.childNodes.find(elementPredicate) || null;
  }
  /**
   * Getter returning the last Element in Element.childNodes.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/lastElementChild
   * @return first childNode that is also an element.
   */


  get lastElementChild() {
    const children = this.children;
    return children[children.length - 1] || null;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
   * @param selector the selector we are trying to match for.
   * @return Element with matching selector.
   */


  querySelector(selector) {
    const matches = querySelectorAll(this, selector);
    return matches ? matches[0] : null;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
   * @param selector the selector we are trying to match for.
   * @return Elements with matching selector.
   */


  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }

}
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
 * @param node the node to filter results under.
 * @param selector the selector we are trying to match for.
 * @return Element with matching selector.
 */

function querySelectorAll(node, selector) {
  // As per spec: https://dom.spec.whatwg.org/#scope-match-a-selectors-string
  // First, parse the selector
  const selectorBracketIndexes = [selector.indexOf('['), selector.indexOf(']')];
  const selectorHasAttr = containsIndexOf(selectorBracketIndexes[0]) && containsIndexOf(selectorBracketIndexes[1]);
  const elementSelector = selectorHasAttr ? selector.substring(0, selectorBracketIndexes[0]) : selector;
  const attrSelector = selectorHasAttr ? selector.substring(selectorBracketIndexes[0], selectorBracketIndexes[1] + 1) : null; // TODO(nainar): Parsing selectors is needed when we add in more complex selectors.
  // Second, find all the matching elements on the Document

  let matcher;

  if (selector[0] === '[') {
    matcher = element => matchAttrReference(selector, element);
  } else if (elementSelector[0] === '#') {
    matcher = selectorHasAttr ? element => element.id === elementSelector.substr(1) && matchAttrReference(attrSelector, element) : element => element.id === elementSelector.substr(1);
  } else if (elementSelector[0] === '.') {
    matcher = selectorHasAttr ? element => element.classList.contains(elementSelector.substr(1)) && matchAttrReference(attrSelector, element) : element => element.classList.contains(elementSelector.substr(1));
  } else {
    matcher = selectorHasAttr ? element => element.localName === toLower(elementSelector) && matchAttrReference(attrSelector, element) : element => element.localName === toLower(elementSelector);
  } // Third, filter to return elements that exist within the querying element's descendants.


  return matcher ? matchChildrenElements(node[45
  /* scopingRoot */
  ], matcher).filter(element => node !== element && node.contains(element)) : [];
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$2;
class DOMTokenList {
  /**
   * The DOMTokenList interface represents a set of space-separated tokens.
   * It is indexed beginning with 0 as with JavaScript Array objects and is case-sensitive.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
   * @param defineOn Element or class extension to define getter/setter pair for token list access.
   * @param target Specific Element instance to modify when value is changed.
   * @param attributeName Name of the attribute used by Element to access DOMTokenList.
   * @param accessorKey Key used to access DOMTokenList directly from specific element.
   * @param propertyName Key used to access DOMTokenList as string getter/setter.
   */
  constructor(defineOn, target, attributeName, accessorKey, propertyName) {
    this[_a$2] = [];
    this[13
    /* target */
    ] = target;
    this[18
    /* attributeName */
    ] = attributeName;
    this[44
    /* storeAttribute */
    ] = target[44
    /* storeAttribute */
    ].bind(target);
    target[46
    /* propertyBackedAttributes */
    ][attributeName] = [() => this.value, value => this.value = value];

    if (accessorKey && propertyName) {
      Object.defineProperty(defineOn.prototype, propertyName, {
        enumerable: true,
        configurable: true,

        get() {
          return this[accessorKey].value;
        },

        set(value) {
          this[accessorKey].value = value;
        }

      });
    }
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value
   * @return string representation of tokens (space delimitted).
   */


  get value() {
    return this[43
    /* tokens */
    ].join(' ');
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/length
   * @return integer representing the number of objects stored in the object.
   */


  get length() {
    return this[43
    /* tokens */
    ].length;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/value
   * @param collection String of values space delimited to replace the current DOMTokenList with.
   */


  set value(collection) {
    const oldValue = this.value;
    const newValue = collection.trim(); // Replace current tokens with new tokens.

    this[43
    /* tokens */
    ].splice(0, this[43
    /* tokens */
    ].length, ...(newValue !== '' ? newValue.split(/\s+/) : ''));
    this.mutated(oldValue, newValue);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/item
   * @param index number from DOMTokenList entities to retrieve value of
   * @return value stored at the index requested, or undefined if beyond known range.
   */


  item(index) {
    return this[43
    /* tokens */
    ][index];
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains
   * @param token value the DOMTokenList is tested for.
   * @return boolean indicating if the token is contained by the DOMTokenList.
   */


  contains(token) {
    return this[43
    /* tokens */
    ].includes(token);
  }
  /**
   * Add a token or tokens to the list.
   * Note: All duplicates are removed, and the first token's position with the value is preserved.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add
   * @param tokens each token is a string to add to a TokenList.
   */


  add() {
    const oldValue = this.value;

    for (var _len = arguments.length, tokens = new Array(_len), _key = 0; _key < _len; _key++) {
      tokens[_key] = arguments[_key];
    }

    this[43
    /* tokens */
    ].splice(0, this[43
    /* tokens */
    ].length, ...new Set(this[43
    /* tokens */
    ].concat(tokens)));
    this.mutated(oldValue, this.value);
  }
  /**
   * Remove a token or tokens from the list.
   * Note: All duplicates are removed, and the first token's position with the value is preserved.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove
   * @param tokens each token is a string to remove from a TokenList.
   */


  remove() {
    for (var _len2 = arguments.length, tokens = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      tokens[_key2] = arguments[_key2];
    }

    const oldValue = this.value;
    this[43
    /* tokens */
    ].splice(0, this[43
    /* tokens */
    ].length, ...new Set(this[43
    /* tokens */
    ].filter(token => !tokens.includes(token))));
    this.mutated(oldValue, this.value);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/replace
   * @param token
   * @param newToken
   */


  replace(token, newToken) {
    if (!this[43
    /* tokens */
    ].includes(token)) {
      return;
    }

    const oldValue = this.value;
    const set = new Set(this[43
    /* tokens */
    ]);

    if (token !== newToken) {
      set.delete(token);

      if (newToken !== '') {
        set.add(newToken);
      }
    }

    this[43
    /* tokens */
    ].splice(0, this[43
    /* tokens */
    ].length, ...set);
    this.mutated(oldValue, this.value);
  }
  /**
   * Adds or removes a token based on its presence in the token list.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
   * @param token string to add or remove from the token list
   * @param force changes toggle into a one way-only operation. true => token added. false => token removed.
   * @return true if the token is in the list following mutation, false if not.
   */


  toggle(token, force) {
    if (!this[43
    /* tokens */
    ].includes(token)) {
      if (force !== false) {
        // Note, this will add the token if force is undefined (not passed into the method), or true.
        this.add(token);
      }

      return true;
    } else if (force !== true) {
      // Note, this will remove the token if force is undefined (not passed into the method), or false.
      this.remove(token);
      return false;
    }

    return true;
  }
  /**
   * Report tokenList mutations to MutationObserver.
   * @param oldValue value before mutation
   * @param value value after mutation
   * @private
   */


  mutated(oldValue, value) {
    this[44
    /* storeAttribute */
    ](this[13
    /* target */
    ].namespaceURI, this[18
    /* attributeName */
    ], value);
    mutate({
      type: 0
      /* ATTRIBUTES */
      ,
      target: this[13
      /* target */
      ],
      attributeName: this[18
      /* attributeName */
      ],
      value,
      oldValue
    });
  }

}
_a$2 = 43
/* tokens */
, 44
/* storeAttribute */
;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const toString = attributes => attributes.map(attr => keyValueString(attr.name, attr.value)).join(' ');
const matchPredicate = (namespaceURI, name) => attr => attr.namespaceURI === namespaceURI && attr.name === name;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class CharacterData extends Node {
  constructor(data, nodeType, nodeName, ownerDocument) {
    super(nodeType, nodeName, ownerDocument);
    this[38
    /* data */
    ] = data;
  } // Unimplemented Methods
  // NonDocumentTypeChildNode.nextElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/nextElementSibling
  // NonDocumentTypeChildNode.previousElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/previousElementSibling
  // CharacterData.appendData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/appendData
  // CharacterData.deleteData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/deleteData
  // CharacterData.insertData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/insertData
  // CharacterData.replaceData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/replaceData
  // CharacterData.substringData() – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/substringData

  /**
   * @return Returns the string contained in private CharacterData.data
   */


  get data() {
    return this[38
    /* data */
    ];
  }
  /**
   * @param value string value to store as CharacterData.data.
   */


  set data(value) {
    const oldValue = this.data;
    this[38
    /* data */
    ] = value;
    mutate({
      target: this,
      type: 1
      /* CHARACTER_DATA */
      ,
      value,
      oldValue
    });
  }
  /**
   * @return Returns the size of the string contained in CharacterData.data
   */


  get length() {
    return this[38
    /* data */
    ].length;
  }
  /**
   * @return Returns the string contained in CharacterData.data
   */


  get nodeValue() {
    return this[38
    /* data */
    ];
  }
  /**
   * @param value string value to store as CharacterData.data.
   */


  set nodeValue(value) {
    this.data = value;
  }

}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class Text extends CharacterData {
  constructor(data, ownerDocument) {
    super(data, 3
    /* TEXT_NODE */
    , '#text', ownerDocument);
    this[8
    /* creationFormat */
    ] = {
      [7
      /* index */
      ]: this[7
      /* index */
      ],
      [11
      /* transferred */
      ]: 0
      /* FALSE */
      ,
      [0
      /* nodeType */
      ]: 3
      /* TEXT_NODE */
      ,
      [1
      /* localOrNodeName */
      ]: store$1('#text'),
      [5
      /* textContent */
      ]: store$1(this.data)
    };
  } // Unimplemented Properties
  // Text.isElementContentWhitespace – https://developer.mozilla.org/en-US/docs/Web/API/Text/isElementContentWhitespace
  // Text.wholeText – https://developer.mozilla.org/en-US/docs/Web/API/Text/wholeText
  // Text.assignedSlot – https://developer.mozilla.org/en-US/docs/Web/API/Text/assignedSlot

  /**
   * textContent getter, retrieves underlying CharacterData data.
   * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
   */


  get textContent() {
    return this.data;
  }
  /**
   * textContent setter, mutates underlying CharacterData data.
   * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
   * @param value new value
   */


  set textContent(value) {
    // Mutation Observation is performed by CharacterData.
    this.nodeValue = value;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
   * @return new Text Node with the same data as the Text to clone.
   */


  cloneNode() {
    return this.ownerDocument.createTextNode(this.data);
  }
  /**
   * Breaks Text node into two nodes at the specified offset, keeping both nodes in the tree as siblings.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Text/splitText
   * @param offset number position to split text at.
   * @return Text Node after the offset.
   */


  splitText(offset) {
    const remainderTextNode = new Text(this.data.slice(offset, this.data.length), this.ownerDocument);
    const parentNode = this.parentNode;
    this.nodeValue = this.data.slice(0, offset);

    if (parentNode !== null) {
      // When this node is attached to the DOM, the remainder text needs to be inserted directly after.
      const parentChildNodes = parentNode.childNodes;
      const insertBeforePosition = parentChildNodes.indexOf(this) + 1;
      const insertBeforeNode = parentChildNodes.length >= insertBeforePosition ? parentChildNodes[insertBeforePosition] : null;
      return parentNode.insertBefore(remainderTextNode, insertBeforeNode);
    }

    return remainderTextNode;
  }

}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$3;

const hyphenateKey = key => toLower(key.replace(/(webkit|ms|moz|khtml)/g, '-$1').replace(/([a-zA-Z])(?=[A-Z])/g, '$1-'));

const appendKeys = keys => {
  const keysToAppend = keys.filter(key => isNaN(key) && !CSSStyleDeclaration.prototype.hasOwnProperty(key));

  if (keysToAppend.length <= 0) {
    return;
  }

  const previousPrototypeLength = CSSStyleDeclaration.prototype.length || 0;

  if (previousPrototypeLength !== 0) {
    CSSStyleDeclaration.prototype.length = previousPrototypeLength + keysToAppend.length;
  } else {
    Object.defineProperty(CSSStyleDeclaration.prototype, 'length', {
      configurable: true,
      writable: true,
      value: keysToAppend.length
    });
  }

  keysToAppend.forEach((key, index) => {
    const hyphenatedKey = hyphenateKey(key);
    CSSStyleDeclaration.prototype[index + previousPrototypeLength] = hyphenatedKey;
    Object.defineProperties(CSSStyleDeclaration.prototype, {
      [key]: {
        get() {
          return this.getPropertyValue(hyphenatedKey);
        },

        set(value) {
          this.setProperty(hyphenatedKey, value);
        }

      }
    });
  });
};
class CSSStyleDeclaration {
  constructor(target) {
    this[_a$3] = {};
    this[44
    /* storeAttribute */
    ] = target[44
    /* storeAttribute */
    ].bind(target);
    this[13
    /* target */
    ] = target;

    if (target && target[46
    /* propertyBackedAttributes */
    ]) {
      target[46
      /* propertyBackedAttributes */
      ].style = [() => this.cssText, value => this.cssText = value];
    }
  }
  /**
   * Retrieve the value for a given property key.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue
   * @param key the name of the property to retrieve the value for.
   * @return value stored for the provided key.
   */


  getPropertyValue(key) {
    return this[3
    /* properties */
    ][key] || '';
  }
  /**
   * Remove a value for a given property key.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty
   * @param key the name of the property to retrieve the value for.
   * @return previously stored value for the provided key.
   */


  removeProperty(key) {
    const oldValue = this.getPropertyValue(key);
    this[3
    /* properties */
    ][key] = null;
    this.mutated(this.cssText);
    return oldValue;
  }
  /**
   * Stores a given value for the provided key.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty
   * @param key modify this key
   * @param value store this value
   */


  setProperty(key, value) {
    this[3
    /* properties */
    ][key] = value;
    this.mutated(this.cssText);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssText
   * @return css text string representing known and valid style declarations.
   */


  get cssText() {
    let value;
    let returnValue = '';

    for (let key in this[3
    /* properties */
    ]) {
      if ((value = this.getPropertyValue(key)) !== '') {
        returnValue += `${key}: ${value}; `;
      }
    }

    return returnValue.trim();
  }
  /**
   * Replace all style declarations with new values parsed from a cssText string.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/cssText
   * @param value css text string to parse and store
   */


  set cssText(value) {
    // value should have an "unknown" type but get/set can't have different types.
    // https://github.com/Microsoft/TypeScript/issues/2521
    const stringValue = typeof value === 'string' ? value : '';
    this[3
    /* properties */
    ] = {};
    const values = stringValue.split(/[:;]/);
    const length = values.length;

    for (let index = 0; index + 1 < length; index += 2) {
      this[3
      /* properties */
      ][toLower(values[index].trim())] = values[index + 1].trim();
    }

    this.mutated(this.cssText);
  }
  /**
   * Report CSSStyleDeclaration mutations to MutationObserver.
   * @param value value after mutation
   * @private
   */


  mutated(value) {
    const oldValue = this[44
    /* storeAttribute */
    ](this[13
    /* target */
    ].namespaceURI, 'style', value);
    mutate({
      type: 0
      /* ATTRIBUTES */
      ,
      target: this[13
      /* target */
      ],
      attributeName: 'style',
      value,
      oldValue
    });
  }

}
_a$3 = 3
/* properties */
, 13
/* target */
;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// TODO: Do enumerated attributes with non-boolean properties exist?

const reflectProperties = (properties, defineOn) => {
  properties.forEach(pair => {
    for (let property in pair) {
      const p = pair[property];
      const defaultValue = p[0];
      const attributeName = p[1] || toLower(property);
      const keywords = p[2];
      const propertyIsNumber = typeof defaultValue === 'number'; // Boolean attributes only care about presence, not attribute value.
      // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes

      const isBooleanAttribute = typeof defaultValue === 'boolean';
      Object.defineProperty(defineOn.prototype, property, {
        enumerable: true,

        get() {
          const element = this;
          const attributeValue = this.getAttribute(attributeName);

          if (keywords) {
            if (element.hasAttribute(attributeName)) {
              return attributeValue === keywords[0];
            } else {
              return defaultValue;
            }
          }

          if (isBooleanAttribute) {
            return element.hasAttribute(attributeName);
          }

          const castableValue = attributeValue || defaultValue;
          return propertyIsNumber ? Number(castableValue) : String(castableValue);
        },

        set(value) {
          const element = this;

          if (keywords) {
            element.setAttribute(attributeName, value ? keywords[0] : keywords[1]);
          } else if (isBooleanAttribute) {
            value ? element.setAttribute(attributeName, '') : element.removeAttribute(attributeName);
          } else {
            element.setAttribute(attributeName, String(value));
          }
        }

      });
    }
  });
};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class Comment extends CharacterData {
  constructor(data, ownerDocument) {
    super(data, 8
    /* COMMENT_NODE */
    , '#comment', ownerDocument);
    this[8
    /* creationFormat */
    ] = {
      [7
      /* index */
      ]: this[7
      /* index */
      ],
      [11
      /* transferred */
      ]: 0
      /* FALSE */
      ,
      [0
      /* nodeType */
      ]: 8
      /* COMMENT_NODE */
      ,
      [1
      /* localOrNodeName */
      ]: store$1(this.nodeName),
      [5
      /* textContent */
      ]: store$1(this.data)
    };
  }
  /**
   * textContent getter, retrieves underlying CharacterData data.
   * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
   */


  get textContent() {
    return this.data;
  }
  /**
   * textContent setter, mutates underlying CharacterData data.
   * This is a different implmentation than DOMv1-4 APIs, but should be transparent to Frameworks.
   * @param value new value
   */


  set textContent(value) {
    // Mutation Observation is performed by CharacterData.
    this.nodeValue = value;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
   * @return new Comment Node with the same data as the Comment to clone.
   */


  cloneNode() {
    return this.ownerDocument.createComment(this.data);
  }

}

function arr_back(arr) {
  return arr[arr.length - 1];
} // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name


const kMarkupPattern = /<!--([^]*)-->|<(\/?)([a-z][-.0-9_a-z]*)([^>]*?)(\/?)>/gi; // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2

const kAttributePattern = /(^|\s)([^\s"'>\/=]+)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/gi;
const kSelfClosingElements = {
  AREA: true,
  BASE: true,
  BR: true,
  COL: true,
  HR: true,
  IMG: true,
  INPUT: true,
  LINK: true,
  META: true,
  PARAM: true,
  SOURCE: true,
  TRACK: true,
  WBR: true
};
const kElementsClosedByOpening = {
  LI: {
    LI: true
  },
  DT: {
    DT: true,
    DD: true
  },
  DD: {
    DD: true,
    DT: true
  },
  P: {
    ADDRESS: true,
    ARTICLE: true,
    ASIDE: true,
    BLOCKQUOTE: true,
    DETAILS: true,
    DIV: true,
    DL: true,
    FIELDSET: true,
    FIGCAPTION: true,
    FIGURE: true,
    FOOTER: true,
    FORM: true,
    H1: true,
    H2: true,
    H3: true,
    H4: true,
    H5: true,
    H6: true,
    HEADER: true,
    HR: true,
    MAIN: true,
    NAV: true,
    OL: true,
    P: true,
    PRE: true,
    SECTION: true,
    TABLE: true,
    UL: true
  },
  RT: {
    RT: true,
    RP: true
  },
  RP: {
    RT: true,
    RP: true
  },
  OPTGROUP: {
    OPTGROUP: true
  },
  OPTION: {
    OPTION: true,
    OPTGROUP: true
  },
  THEAD: {
    TBODY: true,
    TFOOT: true
  },
  TBODY: {
    TBODY: true,
    TFOOT: true
  },
  TR: {
    TR: true
  },
  TD: {
    TD: true,
    TH: true
  },
  TH: {
    TD: true,
    TH: true
  }
};
const kElementsClosedByClosing = {
  LI: {
    UL: true,
    OL: true
  },
  A: {
    DIV: true
  },
  B: {
    DIV: true
  },
  I: {
    DIV: true
  },
  P: {
    DIV: true
  },
  TD: {
    TR: true,
    TABLE: true
  },
  TH: {
    TR: true,
    TABLE: true
  }
};
const kBlockTextElements = {
  SCRIPT: true,
  NOSCRIPT: true,
  STYLE: true,
  PRE: true
};
/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 * @param  {string} data HTML in string format.
 * @param {!Element} root The element to use as root.
 * @return {Element}      root element
 */

function parse(data, rootElement) {
  const ownerDocument = rootElement.ownerDocument;
  const root = new Element(rootElement.nodeType, rootElement.nodeName, rootElement.namespaceURI, ownerDocument);
  let currentParent = root;
  const stack = [root];
  let lastTextPos = 0;
  let match;
  data = '<div>' + data + '</div>';
  const tagsClosed = [];

  while (match = kMarkupPattern.exec(data)) {
    const commentContents = match[1]; // <!--contents-->

    let beginningSlash = match[2]; // ... </ ...

    const tagName = match[3];
    const matchAttributes = match[4];
    const endSlash = match[5]; // ... /> ...

    if (lastTextPos < match.index) {
      // if has content
      const text = data.slice(lastTextPos, match.index);
      currentParent.appendChild(new Text(text, ownerDocument));
    }

    lastTextPos = kMarkupPattern.lastIndex;

    if (commentContents !== undefined) {
      // this is a comment
      currentParent.appendChild(new Comment(commentContents, ownerDocument));
      continue;
    }

    const normalizedTagName = tagName.toUpperCase();

    if (!beginningSlash) {
      // not </ tags
      if (!endSlash && kElementsClosedByOpening[currentParent.tagName]) {
        if (kElementsClosedByOpening[currentParent.tagName][normalizedTagName]) {
          tagsClosed.push(currentParent.tagName);
        }
      }

      const childToAppend = new Element(currentParent.nodeType, tagName.toLowerCase(), // TODO only do this for HTML namespace elements
      currentParent.namespaceURI, ownerDocument);

      for (let attMatch; attMatch = kAttributePattern.exec(matchAttributes);) {
        const attrName = attMatch[2];
        const attrValue = attMatch[4] || attMatch[5] || attMatch[6];
        childToAppend.setAttribute(attrName, attrValue);
      }

      currentParent = currentParent.appendChild(childToAppend);
      stack.push(currentParent);

      if (kBlockTextElements[normalizedTagName]) {
        // a little test to find next </script> or </style> ...
        const closeMarkup = '</' + normalizedTagName.toLowerCase() + '>';
        const index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);

        if (index == -1) {
          throw new Error('Close markup not found.');
        } else {
          kMarkupPattern.lastIndex = index;
        }
      }
    }

    if (beginningSlash || endSlash || kSelfClosingElements[normalizedTagName]) {
      // </ or /> or <br> etc.
      while (true) {
        if (stack.length <= 1) {
          break;
        }

        if (currentParent.nodeName.toUpperCase() == normalizedTagName) {
          stack.pop();
          currentParent = arr_back(stack);
          break;
        } else {
          // Trying to close current tag, and move on
          if (kElementsClosedByClosing[currentParent.tagName]) {
            if (kElementsClosedByClosing[currentParent.tagName][normalizedTagName]) {
              stack.pop();
              currentParent = arr_back(stack);
              continue;
            }
          } // Use aggressive strategy to handle unmatching markups.


          break;
        }
      }
    }
  }

  for (const node of stack) {
    if (tagsClosed[tagsClosed.length - 1] == node.nodeName) {
      stack.pop();
      tagsClosed.pop();
      currentParent = arr_back(stack);
    } else break;
  }

  const valid = stack.length === 1;

  if (!valid) {
    throw new Error('Attempting to parse invalid HTML content.');
  }

  root.childNodes.forEach(node => {
    if (node instanceof Element) {
      node.parentNode = null;
    }
  }); // remove the added <div>

  if (root.firstChild) {
    root.firstChild.childNodes.forEach(node => {
      if (node instanceof Node) {
        node.parentNode = null;
      }
    });
    return root.firstChild;
  }

  throw new Error('Attempting to parse invalid HTML.');
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$4;
const NS_NAME_TO_CLASS = {};
function registerSubclass(localName, subclass, namespace) {
  if (namespace === void 0) {
    namespace = HTML_NAMESPACE;
  }

  const key = `${namespace}:${localName}`;
  NS_NAME_TO_CLASS[key] = subclass;
}
/**
 * There are six kinds of elements, each having different start/close tag semantics.
 * @see https://html.spec.whatwg.org/multipage/syntax.html#elements-2
 */

var ElementKind;

(function (ElementKind) {
  ElementKind[ElementKind["NORMAL"] = 0] = "NORMAL";
  ElementKind[ElementKind["VOID"] = 1] = "VOID"; // The following element kinds have no special handling in worker-dom yet
  // and are lumped into the NORMAL kind.

  /*
  FOREIGN,
  TEMPLATE,
  RAW_TEXT,
  ESCAPABLE_RAW,
  */
})(ElementKind || (ElementKind = {}));
/**
 * @see https://html.spec.whatwg.org/multipage/syntax.html#void-elements
 */


const VOID_ELEMENTS = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];
class Element extends ParentNode {
  constructor(nodeType, localName, namespaceURI, ownerDocument) {
    super(nodeType, toUpper(localName), ownerDocument);
    this.attributes = [];
    this[_a$4] = {};
    this.classList = new DOMTokenList(Element, this, 'class', 'classList', 'className');
    this.style = new CSSStyleDeclaration(this);
    this.namespaceURI = namespaceURI || HTML_NAMESPACE;
    this.localName = localName;
    this.kind = VOID_ELEMENTS.includes(this.tagName) ? ElementKind.VOID : ElementKind.NORMAL;
    this[8
    /* creationFormat */
    ] = {
      [7
      /* index */
      ]: this[7
      /* index */
      ],
      [11
      /* transferred */
      ]: 0
      /* FALSE */
      ,
      [0
      /* nodeType */
      ]: this.nodeType,
      [1
      /* localOrNodeName */
      ]: store$1(this.localName),
      [6
      /* namespaceURI */
      ]: this.namespaceURI === null ? undefined : store$1(this.namespaceURI)
    };
  }
  /**
   * When hydrating the tree, we need to send HydrateableNode representations
   * for the main thread to process and store items from for future modifications.
   */


  hydrate() {
    return Object.assign(this[8
    /* creationFormat */
    ], {
      [4
      /* childNodes */
      ]: this.childNodes.map(node => node.hydrate()),
      [2
      /* attributes */
      ]: this.attributes.map(attribute => [store$1(attribute.namespaceURI || 'null'), store$1(attribute.name), store$1(attribute.value)])
    });
  } // Unimplemented properties
  // Element.clientHeight – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
  // Element.clientLeft – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
  // Element.clientTop – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
  // Element.clientWidth – https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
  // set Element.innerHTML – https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
  // NonDocumentTypeChildNode.nextElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/nextElementSibling
  // Element.prefix – https://developer.mozilla.org/en-US/docs/Web/API/Element/prefix
  // NonDocummentTypeChildNode.previousElementSibling – https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/previousElementSibling
  // Element.scrollHeight – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
  // Element.scrollLeft – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
  // Element.scrollLeftMax – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax
  // Element.scrollTop – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
  // Element.scrollTopMax – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
  // Element.scrollWidth – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
  // Element.shadowRoot – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot
  // Element.slot – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/slot
  // Element.tabStop – https://developer.mozilla.org/en-US/docs/Web/API/Element/tabStop
  // Element.undoManager – https://developer.mozilla.org/en-US/docs/Web/API/Element/undoManager
  // Element.undoScope – https://developer.mozilla.org/en-US/docs/Web/API/Element/undoScope
  // Unimplemented Methods
  // Element.attachShadow() – !! CustomElements – https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
  // Element.animate() – https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
  // Element.closest() – https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
  // Element.getAttributeNames() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames
  // Element.getBoundingClientRect() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  // Element.getClientRects() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects
  // Element.getElementsByTagNameNS() – https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagNameNS
  // Element.insertAdjacentElement() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
  // Element.insertAdjacentHTML() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
  // Element.insertAdjacentText() – https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentText
  // Element.matches() – https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
  // Element.releasePointerCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/releasePointerCapture
  // Element.requestFullscreen() – https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
  // Element.requestPointerLock() – https://developer.mozilla.org/en-US/docs/Web/API/Element/requestPointerLock
  // Element.scrollIntoView() – https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
  // Element.setCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture
  // Element.setPointerCapture() – https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
  // Partially implemented Mixin Methods
  // Both Element.querySelector() and Element.querySelector() are only implemented for the following simple selectors:
  // - Element selectors
  // - ID selectors
  // - Class selectors
  // - Attribute selectors
  // Element.querySelector() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
  // Element.querySelectorAll() – https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
  // Mixins not implemented
  // Slotable.assignedSlot – https://developer.mozilla.org/en-US/docs/Web/API/Slotable/assignedSlot

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
   * @return string representation of serialized HTML describing the Element and its descendants.
   */


  get outerHTML() {
    const tag = this.localName || this.tagName;
    const start = `<${[tag, toString(this.attributes)].join(' ').trim()}>`;
    const contents = this.innerHTML;

    if (!contents) {
      if (this.kind === ElementKind.VOID) {
        // Void elements e.g. <input> only have a start tag (unless children are added programmatically).
        // https://html.spec.whatwg.org/multipage/syntax.html#void-elements
        return start;
      }
    }

    return start + contents + `</${tag}>`;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
   * @return string representation of serialized HTML describing the Element's descendants.
   */


  get innerHTML() {
    const childNodes = this.childNodes;

    if (childNodes.length) {
      return childNodes.map(child => {
        switch (child.nodeType) {
          case 3
          /* TEXT_NODE */
          :
            return child.textContent;

          case 8
          /* COMMENT_NODE */
          :
            return `<!--${child.textContent}-->`;

          default:
            return child.outerHTML;
        }
      }).join('');
    }

    return '';
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
   * @param html The raw html string to parse.
   */


  set innerHTML(html) {
    const root = parse(html, this); // remove previous children

    this.childNodes.forEach(n => {
      propagate(n, 'isConnected', false);
      propagate(n, 45
      /* scopingRoot */
      , n);
    });
    mutate({
      removedNodes: this.childNodes,
      type: 2
      /* CHILD_LIST */
      ,
      target: this
    });
    this.childNodes = []; // add new children

    root.childNodes.forEach(n => {
      this.appendChild(n);
    });
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
   * @param text new text replacing all childNodes content.
   */


  set textContent(text) {
    // TODO(KB): Investigate removing all children in a single .splice to childNodes.
    this.childNodes.forEach(childNode => childNode.remove());
    this.appendChild(new Text(text, this.ownerDocument));
  }
  /**
   * Getter returning the text representation of Element.childNodes.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
   * @return text from all childNodes.
   */


  get textContent() {
    return this.getTextContent();
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
   * @return string tag name (i.e 'div')
   */


  get tagName() {
    return this.nodeName;
  }
  /**
   * Sets the value of an attribute on this element using a null namespace.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
   * @param name attribute name
   * @param value attribute value
   */


  setAttribute(name, value) {
    this.setAttributeNS(HTML_NAMESPACE, name, value);
  }
  /**
   * Get the value of an attribute on this Element with the null namespace.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
   * @param name attribute name
   * @return value of a specified attribute on the element, or null if the attribute doesn't exist.
   */


  getAttribute(name) {
    return this.getAttributeNS(HTML_NAMESPACE, name);
  }
  /**
   * Remove an attribute from this element in the null namespace.
   *
   * Method returns void, so it is not chainable.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
   * @param name attribute name
   */


  removeAttribute(name) {
    this.removeAttributeNS(HTML_NAMESPACE, name);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute
   * @param name attribute name
   * @return Boolean indicating if the element has the specified attribute.
   */


  hasAttribute(name) {
    return this.hasAttributeNS(HTML_NAMESPACE, name);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributes
   * @return Boolean indicating if the element has any attributes.
   */


  hasAttributes() {
    return this.attributes.length > 0;
  }
  /**
   * Sets the value of an attribute on this Element with the provided namespace.
   *
   * If the attribute already exists, the value is updated; otherwise a new attribute is added with the specified name and value.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttributeNS
   * @param namespaceURI
   * @param name attribute name
   * @param value attribute value
   */


  setAttributeNS(namespaceURI, name, value) {
    const valueAsString = String(value);

    if (this[46
    /* propertyBackedAttributes */
    ][name] !== undefined) {
      if (!this.attributes.find(matchPredicate(namespaceURI, name))) {
        this.attributes.push({
          namespaceURI,
          name,
          value: valueAsString
        });
      }

      this[46
      /* propertyBackedAttributes */
      ][name][1](valueAsString);
      return;
    }

    const oldValue = this[44
    /* storeAttribute */
    ](namespaceURI, name, valueAsString);
    mutate({
      type: 0
      /* ATTRIBUTES */
      ,
      target: this,
      attributeName: name,
      attributeNamespace: namespaceURI,
      value: valueAsString,
      oldValue
    });
  }

  [(_a$4 = 46
  /* propertyBackedAttributes */
  , 44
  /* storeAttribute */
  )](namespaceURI, name, value) {
    const attr = this.attributes.find(matchPredicate(namespaceURI, name));
    const oldValue = attr && attr.value || '';

    if (attr) {
      attr.value = value;
    } else {
      this.attributes.push({
        namespaceURI,
        name,
        value
      });
    }

    return oldValue;
  }
  /**
   * Get the value of an attribute on this Element with the specified namespace.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS
   * @param namespaceURI attribute namespace
   * @param name attribute name
   * @return value of a specified attribute on the element, or null if the attribute doesn't exist.
   */


  getAttributeNS(namespaceURI, name) {
    const attr = this.attributes.find(matchPredicate(namespaceURI, name));

    if (attr) {
      return this[46
      /* propertyBackedAttributes */
      ][name] !== undefined ? this[46
      /* propertyBackedAttributes */
      ][name][0]() : attr.value;
    }

    return null;
  }
  /**
   * Remove an attribute from this element in the specified namespace.
   *
   * Method returns void, so it is not chainable.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
   * @param namespaceURI attribute namespace
   * @param name attribute name
   */


  removeAttributeNS(namespaceURI, name) {
    const index = this.attributes.findIndex(matchPredicate(namespaceURI, name));

    if (index >= 0) {
      const oldValue = this.attributes[index].value;
      this.attributes.splice(index, 1);
      mutate({
        type: 0
        /* ATTRIBUTES */
        ,
        target: this,
        attributeName: name,
        attributeNamespace: namespaceURI,
        oldValue
      });
    }
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributeNS
   * @param namespaceURI attribute namespace
   * @param name attribute name
   * @return Boolean indicating if the element has the specified attribute.
   */


  hasAttributeNS(namespaceURI, name) {
    return this.attributes.some(matchPredicate(namespaceURI, name));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
   * @param names contains one more more classnames to match on. Multiples are space seperated, indicating an AND operation.
   * @return Element array with matching classnames
   */


  getElementsByClassName(names) {
    const inputClassList = names.split(' '); // TODO(KB) – Compare performance of [].some(value => DOMTokenList.contains(value)) and regex.
    // const classRegex = new RegExp(classNames.split(' ').map(name => `(?=.*${name})`).join(''));

    return matchChildrenElements(this, element => inputClassList.some(inputClassName => element.classList.contains(inputClassName)));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
   * @param tagName the qualified name to look for. The special string "*" represents all elements.
   * @return Element array with matching tagnames
   */


  getElementsByTagName(tagName) {
    const lowerTagName = toLower(tagName);
    return matchChildrenElements(this, tagName === '*' ? _ => true : element => element.namespaceURI === HTML_NAMESPACE ? element.localName === lowerTagName : element.tagName === tagName);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
   * @param deep boolean determines if the clone should include a recursive copy of all childNodes.
   * @return Element containing all current attributes and potentially childNode clones of the Element requested to be cloned.
   */


  cloneNode(deep) {
    if (deep === void 0) {
      deep = false;
    }

    const clone = this.ownerDocument.createElement(this.nodeName);
    this.attributes.forEach(attr => clone.setAttribute(attr.name, attr.value));

    if (deep) {
      this.childNodes.forEach(child => clone.appendChild(child.cloneNode(deep)));
    }

    return clone;
  }
  /**
   * Return the ClientRect for an Element once determined by the main thread.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
   * @return Promise<ClientRect>
   *
   * Note: Edge and IE11 do not return the x/y value, but top/left are equivalent. Normalize the values here.
   */


  getBoundingClientRectAsync() {
    const defaultValue = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    return new Promise(resolve => {
      if (typeof addEventListener !== 'function' || !this.isConnected) {
        // Elements run within Node runtimes are missing addEventListener as a global.
        // In this case, treat the return value the same as a disconnected node.
        resolve(defaultValue);
      } else {
        addEventListener('message', (_ref) => {
          let data = _ref.data;

          if (data[12
          /* type */
          ] === 5
          /* GET_BOUNDING_CLIENT_RECT */
          && data[13
          /* target */
          ][7
          /* index */
          ] === this[7
          /* index */
          ]) {
            const transferredBoundingClientRect = data[38
            /* data */
            ];
            resolve({
              top: transferredBoundingClientRect[0],
              right: transferredBoundingClientRect[1],
              bottom: transferredBoundingClientRect[2],
              left: transferredBoundingClientRect[3],
              width: transferredBoundingClientRect[4],
              height: transferredBoundingClientRect[5],
              x: transferredBoundingClientRect[0],
              y: transferredBoundingClientRect[3]
            });
          }
        }); // Requesting a boundingClientRect can be depdendent on mutations that have not yet
        // applied in the main thread. As a result, ensure proper order of DOM mutation and reads
        // by sending the request for a boundingClientRect as a mutation.

        mutate({
          type: 5
          /* GET_BOUNDING_CLIENT_RECT */
          ,
          target: this
        });
        setTimeout(resolve, 500, defaultValue); // TODO: Why a magical constant, define and explain.
      }
    });
  }

}
reflectProperties([{
  id: ['']
}], Element);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$5, _b;

class Event {
  constructor(type, opts) {
    this[_a$5] = false;
    this[_b] = false;
    this.type = type;
    this.bubbles = !!opts.bubbles;
    this.cancelable = !!opts.cancelable;
  }

  stopPropagation() {
    this[50
    /* stop */
    ] = true;
  }

  stopImmediatePropagation() {
    this[51
    /* end */
    ] = this[50
    /* stop */
    ] = true;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
  /** Event.initEvent() is deprecated but supported here for legacy usage.  */


  initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
  }

}
_a$5 = 50
/* stop */
, _b = 51
/* end */
;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLElement extends Element {
  click() {
    this.dispatchEvent(new Event('click', {
      bubbles: true,
      cancelable: true
    }));
  }

  focus() {
    this.ownerDocument.activeElement = this;
    this.dispatchEvent(new Event('focus', {}));
  }
  /**
   * Find the nearest parent form element.
   * Implemented in HTMLElement since so many extensions of HTMLElement repeat this functionality. This is not to spec.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement
   * @return nearest parent form element.
   */


  get form() {
    return matchNearestParent(this, tagNameConditionPredicate(['FORM']));
  }

} // Reflected properties
// HTMLElement.accessKey => string, reflected attribute
// HTMLElement.contentEditable => string, reflected attribute
// HTMLElement.dir => string, reflected attribute
// HTMLElement.lang => string, reflected attribute
// HTMLElement.title => string, reflected attribute
// HTMLElement.draggable => boolean, reflected attribute
// HTMLElement.hidden => boolean, reflected attribute
// HTMLElement.noModule => boolean, reflected attribute
// HTMLElement.spellcheck => boolean, reflected attribute
// HTMLElement.translate => boolean, reflected attribute

reflectProperties([{
  accessKey: ['']
}, {
  contentEditable: ['inherit']
}, {
  dir: ['']
}, {
  lang: ['']
}, {
  title: ['']
}, {
  draggable: [false,
  /* attr */
  undefined,
  /* keywords */
  ['true', 'false']]
}, {
  hidden: [false,
  /* attr */
  undefined]
}, {
  noModule: [false]
}, {
  spellcheck: [true,
  /* attr */
  undefined,
  /* keywords */
  ['true', 'false']]
}, {
  translate: [true,
  /* attr */
  undefined,
  /* keywords */
  ['yes', 'no']]
}], HTMLElement); // Properties
// HTMLElement.accessKeyLabel => string, readonly value of "accessKey"
// HTMLElement.isContentEditable => boolean, readonly value of contentEditable
// HTMLElement.nonce => string, NOT REFLECTED
// HTMLElement.tabIndex => number, reflected attribute
// Layout Properties (TBD)
// HTMLElement.offsetHeight => double, readonly
// HTMLElement.offsetLeft => double, readonly
// HTMLElement.offsetParent => Element
// HTMLElement.offsetTop => double, readonly
// HTMLElement.offsetWidth => double, readonly
// Unimplemented Properties
// HTMLElement.contextMenu => HTMLElement
// HTMLElement.dataset => Map<string (get/set), string>
// HTMLElement.dropzone => DOMSettableTokenList (DOMTokenList)
// HTMLElement.inert => boolean, reflected
// HTMLElement.itemScope => boolean
// HTMLElement.itemType => DOMSettableTokenList (DOMTokenList)
// HTMLElement.itemId => string
// HTMLElement.itemRef => DOMSettableTokenList (DOMTokenList)
// HTMLElement.itemProp => DOMSettableTokenList (DOMTokenList)
// HTMLElement.itemValue => object
// HTMLElement.properties => HTMLPropertiesCollection, readonly

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLAnchorElement extends HTMLElement {
  constructor() {
    super(...arguments);
    this.relList = new DOMTokenList(HTMLAnchorElement, this, 'rel', 'relList', 'rel');
  }
  /**
   * Returns the href property/attribute value
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/toString
   * @return string href attached to HTMLAnchorElement
   */


  toString() {
    return this.href;
  }
  /**
   * A Synonym for the Node.textContent property getter.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
   * @return value of text node direct child of this Element.
   */


  get text() {
    return this.textContent;
  }
  /**
   * A Synonym for the Node.textContent property setter.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
   * @param text replacement for all current childNodes.
   */


  set text(text) {
    this.textContent = text;
  }

}
registerSubclass('a', HTMLAnchorElement); // Reflected properties, strings.
// HTMLAnchorElement.href => string, reflected attribute
// HTMLAnchorElement.hreflang => string, reflected attribute
// HTMLAnchorElement.media => string, reflected attribute
// HTMLAnchorElement.target => string, reflected attribute
// HTMLAnchorElement.type => string, reflected attribute

reflectProperties([{
  href: ['']
}, {
  hreflang: ['']
}, {
  media: ['']
}, {
  target: ['']
}, {
  type: ['']
}], HTMLAnchorElement); // Unimplemented
// HTMLAnchorElement.download => string, reflected attribute
// HTMLAnchorElement.type => Is a DOMString that reflects the type HTML attribute, indicating the MIME type of the linked resource.
// Unimplemented URL parse of href attribute due to IE11 compatibility and low usage.
// Note: Implementation doable using a private url property

/*
  class {
    private url: URL | null = null;

    constructor(...) {
      // Element.getAttribute('href') => Element.href.
      Object.assign(this[TransferrableKeys.propertyBackedAttributes], {
        href: this.href,
      });
    }

    get href(): string {
      return this.url ? this.url.href : '';
    }
    set href(url: string) {
      this.url = new URL(url);
      this.setAttribute('href', this.url.href);
    }
  }
*/
// HTMLAnchorElement.host => string
// HTMLAnchorElement.hostname => string
// HTMLAnchorElement.protocol => string
// HTMLAnchorElement.pathname => string
// HTMLAnchorElement.search => string
// HTMLAnchorElement.hash => string
// HTMLAnchorElement.username => string
// HTMLAnchorElement.password => string
// HTMLAnchorElement.origin => string, readonly (getter no setter)

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLButtonElement extends HTMLElement {}
registerSubclass('button', HTMLButtonElement); // Reflected properties, strings.
// HTMLButtonElement.formAction => string, reflected attribute
// HTMLButtonElement.formEnctype => string, reflected attribute
// HTMLButtonElement.formMethod => string, reflected attribute
// HTMLButtonElement.formTarget => string, reflected attribute
// HTMLButtonElement.name => string, reflected attribute
// HTMLButtonElement.type => string, reflected attribute (default submit)
// HTMLButtonElement.value => string, reflected attribute
// HTMLButtonElement.autofocus => boolean, reflected attribute
// HTMLButtonElement.disabled => boolean, reflected attribute

reflectProperties([{
  formAction: ['']
}, {
  formEnctype: ['']
}, {
  formMethod: ['']
}, {
  formTarget: ['']
}, {
  name: ['']
}, {
  type: ['submit']
}, {
  value: ['']
}, {
  autofocus: [false]
}, {
  disabled: [false]
}], HTMLButtonElement); // Not reflected
// HTMLButtonElement.formNoValidate => boolean
// HTMLButtonElement.validity => ValidityState, readonly
// Unimplemented
// HTMLButtonElement.form => HTMLFormElement | null, readonly
// HTMLButtonElement.labels => Array<HTMLLabelElement>, readonly
// HTMLButtonElement.menu => HTMLMenuElement
// HTMLButtonElement.willValidate => boolean, readonly
// HTMLButtonElement.validationMessage => string, readonly

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLDataElement extends HTMLElement {}
registerSubclass('data', HTMLDataElement); // Reflected properties, strings.
// HTMLEmbedElement.value => string, reflected attribute

reflectProperties([{
  value: ['']
}], HTMLDataElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLEmbedElement extends HTMLElement {}
registerSubclass('embed', HTMLEmbedElement); // Reflected properties, strings.
// HTMLEmbedElement.height => string, reflected attribute
// HTMLEmbedElement.src => string, reflected attribute
// HTMLEmbedElement.type => string, reflected attribute
// HTMLEmbedElement.width => string, reflected attribute

reflectProperties([{
  height: ['']
}, {
  src: ['']
}, {
  type: ['']
}, {
  width: ['']
}], HTMLEmbedElement); // Unimplemented
// HTMLEmbedElement.align => string, not reflected
// HTMLEmbedElement.name => string, not reflected

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const MATCHING_CHILD_ELEMENT_TAGNAMES = 'BUTTON FIELDSET INPUT OBJECT OUTPUT SELECT TEXTAREA'.split(' ');
/**
 * The HTMLFormControlsCollection interface represents a collection of HTML form control elements.
 * It is mixedin to both HTMLFormElement and HTMLFieldSetElement.
 */

const HTMLFormControlsCollectionMixin = defineOn => {
  Object.defineProperty(defineOn.prototype, 'elements', {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormControlsCollection
     * @return Element array matching children of specific tagnames.
     */
    get() {
      return matchChildrenElements(this, tagNameConditionPredicate(MATCHING_CHILD_ELEMENT_TAGNAMES));
    }

  });
};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLFieldSetElement extends HTMLElement {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement
   * @return hardcoded string 'fieldset'
   */
  get type() {
    return toLower(this.tagName);
  }

}
registerSubclass('fieldset', HTMLFieldSetElement);
HTMLFormControlsCollectionMixin(HTMLFieldSetElement); // Reflected properties
// HTMLFieldSetElement.name => string, reflected attribute
// HTMLFieldSetElement.disabled => boolean, reflected attribute

reflectProperties([{
  name: ['']
}, {
  disabled: [false]
}], HTMLFieldSetElement); // Unimplemented properties
// HTMLFieldSetElement.validity
// HTMLFieldSetElement.willValidate
// HTMLFieldSetElement.validationMessage

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLFormElement extends HTMLElement {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/length
   * @return number of controls in the form
   */
  get length() {
    return this.elements.length;
  }

}
registerSubclass('form', HTMLFormElement);
HTMLFormControlsCollectionMixin(HTMLFormElement); // Reflected properties
// HTMLFormElement.name => string, reflected attribute
// HTMLFormElement.method => string, reflected attribute
// HTMLFormElement.target => string, reflected attribute
// HTMLFormElement.action => string, reflected attribute
// HTMLFormElement.enctype => string, reflected attribute
// HTMLFormElement.acceptCharset => string, reflected attribute
// HTMLFormElement.autocomplete => string, reflected attribute
// HTMLFormElement.autocapitalize => string, reflected attribute

reflectProperties([{
  name: ['']
}, {
  method: ['get']
}, {
  target: ['']
}, {
  action: ['']
}, {
  enctype: ['application/x-www-form-urlencoded']
}, {
  acceptCharset: ['', 'accept-charset']
}, {
  autocomplete: ['on']
}, {
  autocapitalize: ['sentences']
}], HTMLFormElement); // Unimplemented properties
// HTMLFormElement.encoding => string, reflected attribute
// HTMLFormElement.noValidate => boolean, reflected attribute

/*
Unimplemented, TBD:

Named inputs are added to their owner form instance as properties, and can overwrite native properties
if they share the same name (eg a form with an input named action will have its action property return
that input instead of the form's action HTML attribute).
*/

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLIFrameElement extends HTMLElement {
  constructor() {
    super(...arguments); // HTMLIFrameElement.sandbox, DOMTokenList, reflected attribute

    this.sandbox = new DOMTokenList(HTMLIFrameElement, this, 'sandbox', null, null);
  }

}
registerSubclass('iframe', HTMLIFrameElement); // Reflected properties
// HTMLIFrameElement.allow => string, reflected attribute
// HTMLIFrameElement.allowFullscreen => boolean, reflected attribute
// HTMLIFrameElement.csp => string, reflected attribute
// HTMLIFrameElement.height => string, reflected attribute
// HTMLIFrameElement.name => string, reflected attribute
// HTMLIFrameElement.referrerPolicy => string, reflected attribute
// HTMLIFrameElement.src => string, reflected attribute
// HTMLIFrameElement.srcdoc => string, reflected attribute
// HTMLIFrameElement.width => string, reflected attribute

reflectProperties([{
  allow: ['']
}, {
  allowFullscreen: [false]
}, {
  csp: ['']
}, {
  height: ['']
}, {
  name: ['']
}, {
  referrerPolicy: ['']
}, {
  src: ['']
}, {
  srcdoc: ['']
}, {
  width: ['']
}], HTMLIFrameElement); // Unimplemented Properties
// HTMLIFrameElement.allowPaymentRequest => boolean, reflected attribute
// HTMLIFrameElement.contentDocument => Document, read only (active document in the inline frame's nested browsing context)
// HTMLIFrameElement.contentWindow => WindowProxy, read only (window proxy for the nested browsing context)

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLImageElement extends HTMLElement {}
registerSubclass('img', HTMLImageElement); // Reflected Properties
// HTMLImageElement.alt => string, reflected attribute
// HTMLImageElement.crossOrigin => string, reflected attribute
// HTMLImageElement.height => number, reflected attribute
// HTMLImageElement.isMap => boolean, reflected attribute
// HTMLImageElement.referrerPolicy => string, reflected attribute
// HTMLImageElement.src => string, reflected attribute
// HTMLImageElement.sizes => string, reflected attribute
// HTMLImageElement.srcset => string, reflected attribute
// HTMLImageElement.useMap => string, reflected attribute
// HTMLImageElement.width => number, reflected attribute

reflectProperties([{
  alt: ['']
}, {
  crossOrigin: ['']
}, {
  height: [0]
}, {
  isMap: [false]
}, {
  referrerPolicy: ['']
}, {
  src: ['']
}, {
  sizes: ['']
}, {
  srcset: ['']
}, {
  useMap: ['']
}, {
  width: [0]
}], HTMLImageElement); // Unimplmented Properties
// HTMLImageElement.complete Read only
// Returns a Boolean that is true if the browser has finished fetching the image, whether successful or not. It also shows true, if the image has no src value.
// HTMLImageElement.currentSrc Read only
// Returns a DOMString representing the URL to the currently displayed image (which may change, for example in response to media queries).
// HTMLImageElement.naturalHeight Read only
// Returns a unsigned long representing the intrinsic height of the image in CSS pixels, if it is available; else, it shows 0.
// HTMLImageElement.naturalWidth Read only
// Returns a unsigned long representing the intrinsic width of the image in CSS pixels, if it is available; otherwise, it will show 0.

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The HTMLInputLabels interface represents a collection of input getters for their related label Elements.
 * It is mixedin to both HTMLInputElement, HTMLMeterElement, and HTMLProgressElement.
 */

const HTMLInputLabelsMixin = defineOn => {
  Object.defineProperty(defineOn.prototype, 'labels', {
    /**
     * Getter returning label elements associated to this meter.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLProgressElement/labels
     * @return label elements associated to this meter.
     */
    get() {
      return matchChildrenElements(this.ownerDocument || this, element => element.tagName === 'LABEL' && element.for && element.for === this.id);
    }

  });
};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$6, _b$1;
class HTMLInputElement extends HTMLElement {
  constructor() {
    super(...arguments); // Per spec, some attributes like 'value' and 'checked' change behavior based on dirty flags.
    // Since these flags can only be changed on interaction (outside of worker), we can ignore them here.
    // Tradeoffs: Consequent attribute changes are missing, HTMLFormElement.reset() doesn't work, etc.
    // Alternative: Implement dirty flag checking in worker-dom, which would require listening for
    //     and forwarding interaction events to flag "dirtiness".
    // https://html.spec.whatwg.org/multipage/input.html#common-input-element-apis

    this[_a$6] = '';
    this[_b$1] = false;
  } // TODO(willchou): There are a few interrelated issues with `value` property.
  //   1. "Dirtiness" caveat above.
  //   2. Duplicate SYNC events. Sent by every event fired from elements with a `value`, plus the default 'change' listener.
  //   3. Duplicate MUTATE events. Caused by stale `value` in worker due to no default 'input' listener (see below).


  get value() {
    return this[21
    /* value */
    ];
  }

  set value(value) {
    // Don't early-out if value doesn't appear to have changed.
    // The worker may have a stale value since 'input' events aren't being forwarded.
    this[21
    /* value */
    ] = String(value);
    mutate({
      type: 3
      /* PROPERTIES */
      ,
      target: this,
      propertyName: 'value',
      value
    });
  }

  get valueAsDate() {
    // Don't use Date constructor or Date.parse() since ISO 8601 (yyyy-mm-dd) parsing is inconsistent.
    const date = this.stringToDate(this[21
    /* value */
    ]);
    const invalid = !date || isNaN(date.getTime());
    return invalid ? null : date;
  }
  /** Unlike browsers, does not throw if this input[type] doesn't support dates. */


  set valueAsDate(value) {
    if (!(value instanceof Date)) {
      throw new TypeError('The provided value is not a Date.');
    }

    this.value = this.dateToString(value);
  }

  get valueAsNumber() {
    if (this[21
    /* value */
    ].length === 0) {
      return NaN;
    }

    return Number(this[21
    /* value */
    ]);
  }
  /** Unlike browsers, does not throw if this input[type] doesn't support numbers. */


  set valueAsNumber(value) {
    if (typeof value === 'number') {
      this.value = String(value);
    } else {
      this.value = '';
    }
  }

  get checked() {
    return this[47
    /* checked */
    ];
  }

  set checked(value) {
    if (this[47
    /* checked */
    ] === value) {
      return;
    }

    this[47
    /* checked */
    ] = !!value;
    mutate({
      type: 3
      /* PROPERTIES */
      ,
      target: this,
      propertyName: 'checked',
      // TODO(choumx, #122): Proper support for non-string property mutations.
      value: String(value)
    });
  }
  /**
   * Returns a date in 'yyyy-mm-dd' format.
   * @param date
   */


  dateToString(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1; // getMonth() is 0-index.

    const d = date.getDate();
    return `${y}-${m > 9 ? '' : '0'}${m}-${d > 9 ? '' : '0'}${d}`;
  }
  /**
   * Returns a Date from a 'yyyy-mm-dd' format.
   * @param s
   */


  stringToDate(str) {
    const components = str.split('-');

    if (components.length !== 3) {
      return null;
    }

    const y = components[0],
          m = components[1],
          d = components[2]; // Month is 0-index.

    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }

}
_a$6 = 21
/* value */
, _b$1 = 47
/* checked */
;
registerSubclass('input', HTMLInputElement);
HTMLInputLabelsMixin(HTMLInputElement); // Reflected Properties
// HTMLInputElement.formAction => string, reflected attribute
// HTMLInputElement.formEncType	=> string, reflected attribute
// HTMLInputElement.formMethod => string, reflected attribute
// HTMLInputElement.formTarget => string, reflected attribute
// HTMLInputElement.name => string, reflected attribute
// HTMLInputElement.type => string, reflected attribute
// HTMLInputElement.disabled => boolean, reflected attribute
// HTMLInputElement.autofocus => boolean, reflected attribute
// HTMLInputElement.required => boolean, reflected attribute
// HTMLInputElement.defaultChecked => boolean, reflected attribute ("checked")
// HTMLInputElement.alt => string, reflected attribute
// HTMLInputElement.height => number, reflected attribute
// HTMLInputElement.src => string, reflected attribute
// HTMLInputElement.width => number, reflected attribute
// HTMLInputElement.accept => string, reflected attribute
// HTMLInputElement.autocomplete => string, reflected attribute
// HTMLInputElement.maxLength => number, reflected attribute
// HTMLInputElement.size => number, reflected attribute
// HTMLInputElement.pattern => string, reflected attribute
// HTMLInputElement.placeholder => string, reflected attribute
// HTMLInputElement.readOnly => boolean, reflected attribute
// HTMLInputElement.min => string, reflected attribute
// HTMLInputElement.max => string, reflected attribute
// HTMLInputElement.defaultValue => string, reflected attribute
// HTMLInputElement.dirname => string, reflected attribute
// HTMLInputElement.multiple => boolean, reflected attribute
// HTMLInputElement.step => string, reflected attribute
// HTMLInputElement.autocapitalize => string, reflected attribute

reflectProperties([{
  accept: ['']
}, {
  alt: ['']
}, {
  autocapitalize: ['']
}, {
  autocomplete: ['']
}, {
  autofocus: [false]
}, {
  defaultChecked: [false,
  /* attr */
  'checked']
}, {
  defaultValue: ['', 'value']
}, {
  dirName: ['']
}, {
  disabled: [false]
}, {
  formAction: ['']
}, {
  formEncType: ['']
}, {
  formMethod: ['']
}, {
  formTarget: ['']
}, {
  height: [0]
}, {
  max: ['']
}, {
  maxLength: [0]
}, {
  min: ['']
}, {
  multiple: [false]
}, {
  name: ['']
}, {
  pattern: ['']
}, {
  placeholder: ['']
}, {
  readOnly: [false]
}, {
  required: [false]
}, {
  size: [0]
}, {
  src: ['']
}, {
  step: ['']
}, {
  type: ['text']
}, {
  width: [0]
}], HTMLInputElement); // TODO(KB) Not Reflected Properties
// HTMLInputElement.indeterminate => boolean
// Unimplemented Properties
// HTMLInputElement.formNoValidate => string, reflected attribute
// HTMLInputElement.validity => ValidityState, readonly
// HTMLInputElement.validationMessage => string, readonly
// HTMLInputElement.willValidate => boolean, readonly
// HTMLInputElement.allowdirs => boolean
// HTMLInputElement.files	=> Array<File>
// HTMLInputElement.webkitdirectory	=> boolean, reflected attribute
// HTMLInputElement.webkitEntries => Array<FileSystemEntry>
// HTMLInputElement.selectionStart => number
// HTMLInputElement.selectionEnd => number
// HTMLInputElement.selectionDirection => string
// HTMLInputElement.list => Element, read only (element pointed by list attribute)
// Unimplemented Methods
// HTMLInputElement.setSelectionRange()
// HTMLInputElement.setRangeText()
// HTMLInputElement.setCustomValidity()
// HTMLInputElement.checkValidity()
// HTMLInputElement.stepDown()
// HTMLInputElement.stepUp()

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLLabelElement extends HTMLElement {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control
   * @return input element
   */
  get control() {
    const htmlFor = this.getAttribute('for');

    if (htmlFor !== null) {
      return this.ownerDocument && this.ownerDocument.getElementById(htmlFor);
    }

    return matchChildElement(this, tagNameConditionPredicate(['INPUT']));
  }

}
registerSubclass('label', HTMLLabelElement); // Reflected Properties
// HTMLLabelElement.htmlFor => string, reflected attribute 'for'

reflectProperties([{
  htmlFor: ['', 'for']
}], HTMLLabelElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLLinkElement extends HTMLElement {
  constructor() {
    super(...arguments);
    this.relList = new DOMTokenList(HTMLLinkElement, this, 'rel', 'relList', 'rel');
  }

}
registerSubclass('link', HTMLLinkElement); // Reflected Properties
// HTMLLinkElement.as => string, reflected attribute
// HTMLLinkElement.crossOrigin => string, reflected attribute
// HTMLLinkElement.disabled => boolean, reflected attribute
// HTMLLinkElement.href => string, reflected attribute
// HTMLLinkElement.hreflang => string, reflected attribute
// HTMLLinkElement.media => string, reflected attribute
// HTMLLinkElement.referrerPolicy => string, reflected attribute
// HTMLLinkElement.sizes => string, reflected attribute
// HTMLLinkElement.type => string, reflected attribute

reflectProperties([{
  as: ['']
}, {
  crossOrigin: ['']
}, {
  disabled: [false]
}, {
  href: ['']
}, {
  hreflang: ['']
}, {
  media: ['']
}, {
  referrerPolicy: ['']
}, {
  sizes: ['']
}, {
  type: ['']
}], HTMLLinkElement); // Unimplemented Properties
// LinkStyle.sheet Read only
// Returns the StyleSheet object associated with the given element, or null if there is none.

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLMapElement extends HTMLElement {
  /**
   * Getter returning area elements associated to this map.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMapElement
   * @return area elements associated to this map.
   */
  get areas() {
    return matchChildrenElements(this, element => element.tagName === 'AREA');
  }

}
registerSubclass('map', HTMLMapElement); // Reflected Properties
// HTMLMapElement.name => string, reflected attribute

reflectProperties([{
  name: ['']
}], HTMLMapElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLMeterElement extends HTMLElement {}
registerSubclass('meter', HTMLMeterElement);
HTMLInputLabelsMixin(HTMLMeterElement); // Reflected Properties
// HTMLMeterElement.high => number, reflected attribute
// HTMLMeterElement.low => number, reflected attribute
// HTMLMeterElement.max => number, reflected attribute
// HTMLMeterElement.min => number, reflected attribute
// HTMLMeterElement.optimum => number, reflected attribute
// HTMLMeterElement.value => number, reflected attribute

reflectProperties([{
  high: [0]
}, {
  low: [0]
}, {
  max: [1]
}, {
  min: [0]
}, {
  optimum: [0]
}, {
  value: [0]
}], HTMLMeterElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLModElement extends HTMLElement {}
registerSubclass('del', HTMLModElement);
registerSubclass('ins', HTMLModElement); // Reflected Properties
// HTMLModElement.cite => string, reflected attribute
// HTMLModElement.datetime => string, reflected attribute

reflectProperties([{
  cite: ['']
}, {
  datetime: ['']
}], HTMLModElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLOListElement extends HTMLElement {}
registerSubclass('ol', HTMLOListElement); // Reflected Properties
// HTMLModElement.reversed => boolean, reflected attribute
// HTMLModElement.start => number, reflected attribute
// HTMLOListElement.type => string, reflected attribute

reflectProperties([{
  reversed: [false]
}, {
  start: [1]
}, {
  type: ['']
}], HTMLOListElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$7;
class HTMLOptionElement extends HTMLElement {
  constructor(nodeType, localName, namespaceURI, ownerDocument) {
    super(nodeType, localName, namespaceURI, ownerDocument);
    this[_a$7] = false;
    this[46
    /* propertyBackedAttributes */
    ].selected = [() => String(this[52
    /* selected */
    ]), value => this.selected = value === 'true'];
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @return position of the option within the list of options it's within, or zero if there is no valid parent.
   */


  get index() {
    return this.parentNode && this.parentNode.children.indexOf(this) || 0;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @return label attribute value or text content if there is no attribute.
   */


  get label() {
    return this.getAttribute('label') || this.textContent;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @param label new label value to store as an attribute.
   */


  set label(label) {
    this.setAttribute('label', label);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @return boolean based on if the option element is selected.
   */


  get selected() {
    return this[52
    /* selected */
    ];
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @param value new selected boolean value.
   */


  set selected(value) {
    this[52
    /* selected */
    ] = value; // TODO(KB) This is a mutation.
  }
  /**
   * A Synonym for the Node.textContent property getter.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @return value of text node direct child of this Element.
   */


  get text() {
    return this.textContent;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @param text new text content to store for this Element.
   */


  set text(text) {
    this.textContent = text;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @return value attribute value or text content if there is no attribute.
   */


  get value() {
    return this.getAttribute('value') || this.textContent;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
   * @param value new value for an option element.
   */


  set value(value) {
    this.setAttribute('value', value);
  }

}
_a$7 = 52
/* selected */
;
registerSubclass('option', HTMLOptionElement); // Reflected Properties
// HTMLOptionElement.defaultSelected => boolean, reflected attribute
// HTMLOptionElement.disabled => boolean, reflected attribute
// HTMLOptionElement.type => string, reflected attribute

reflectProperties([{
  defaultSelected: [false, 'selected']
}, {
  disabled: [false]
}, {
  type: ['']
}], HTMLOptionElement); // Implemented at HTMLElement
// HTMLOptionElement.form, Read only	=> HTMLFormElement

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$8, _b$2;
class HTMLProgressElement extends HTMLElement {
  constructor() {
    super(...arguments);
    this[_a$8] = true;
    this[_b$2] = 0;
  }

  get position() {
    return this[48
    /* indeterminate */
    ] ? -1 : this[21
    /* value */
    ] / this.max;
  }

  get value() {
    return this[21
    /* value */
    ];
  }

  set value(value) {
    this[48
    /* indeterminate */
    ] = false;
    this[21
    /* value */
    ] = value; // TODO(KB) This is a property mutation needing tracked.
  }

}
_a$8 = 48
/* indeterminate */
, _b$2 = 21
/* value */
;
registerSubclass('progress', HTMLProgressElement);
HTMLInputLabelsMixin(HTMLProgressElement); // Reflected Properties
// HTMLModElement.max => number, reflected attribute

reflectProperties([{
  max: [1]
}], HTMLProgressElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLQuoteElement extends HTMLElement {}
registerSubclass('blockquote', HTMLQuoteElement);
registerSubclass('q', HTMLQuoteElement); // Reflected Properties
// HTMLModElement.cite => string, reflected attribute

reflectProperties([{
  cite: ['']
}], HTMLQuoteElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLScriptElement extends HTMLElement {
  /**
   * A Synonym for the Node.textContent property getter.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
   * @return value of text node direct child of this Element.
   */
  get text() {
    return this.textContent;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
   * @param text new text content to store for this Element.
   */


  set text(text) {
    this.textContent = text;
  }

}
registerSubclass('script', HTMLScriptElement); // Reflected Properties
// HTMLScriptElement.type => string, reflected attribute
// HTMLScriptElement.src => string, reflected attribute
// HTMLScriptElement.charset => string, reflected attribute
// HTMLScriptElement.async => boolean, reflected attribute
// HTMLScriptElement.defer => boolean, reflected attribute
// HTMLScriptElement.crossOrigin => string, reflected attribute
// HTMLScriptElement.noModule => boolean, reflected attribute

reflectProperties([{
  type: ['']
}, {
  src: ['']
}, {
  charset: ['']
}, {
  async: [false]
}, {
  defer: [false]
}, {
  crossOrigin: ['']
}, {
  noModule: [false]
}], HTMLScriptElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a$9;
const isOptionPredicate = tagNameConditionPredicate(['OPTION']);

const isSelectedOptionPredicate = element => element.tagName === 'OPTION' && element.selected;

class HTMLSelectElement extends HTMLElement {
  constructor() {
    super(...arguments);
    this[_a$9] = -1
    /* UNMODIFIED */
    ;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/length
   * @return number of controls in the form
   */


  get length() {
    return matchChildrenElements(this, isOptionPredicate).length;
  }
  /**
   * Getter returning option elements that are direct children of a HTMLSelectElement
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
   * @return Element "options" objects that are direct children.
   */


  get options() {
    return this.children.filter(isOptionPredicate);
  }
  /**
   * Getter returning the index of the first selected <option> element.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
   * @return the index of the first selected option element, or -1 if no element is selected.
   */


  get selectedIndex() {
    const firstSelectedChild = matchChildElement(this, isSelectedOptionPredicate);
    return firstSelectedChild ? this.children.indexOf(firstSelectedChild) : -1;
  }
  /**
   * Setter making the <option> element at the passed index selected.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedIndex
   * @param selectedIndex index number to make selected.
   */


  set selectedIndex(selectedIndex) {
    this.children.forEach((element, index) => element.selected = index === selectedIndex);
  }
  /**
   * Getter returning the <option> elements selected.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedOptions
   * @return array of Elements currently selected.
   */


  get selectedOptions() {
    return matchChildrenElements(this, isSelectedOptionPredicate);
  }
  /**
   * Getter returning the size of the select element (by default 1 for single and 4 for multiple)
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
   * @return size of the select element.
   */


  get size() {
    return this[49
    /* size */
    ] === -1
    /* UNMODIFIED */
    ? this.multiple ? 4
    /* MULTIPLE */
    : 1
    /* SINGLE */
    : this[49
    /* size */
    ];
  }
  /**
   * Override the size of this element (each positive unit is the height of a single option)
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
   * @param size number to set the size to.
   */


  set size(size) {
    this[49
    /* size */
    ] = size > 0 ? size : this.multiple ? 4
    /* MULTIPLE */
    : 1
    /* SINGLE */
    ;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
   * @return string representing the select element type.
   */


  get type() {
    return this.multiple ? "select-one"
    /* MULTIPLE */
    : "select-multiple"
    /* SINGLE */
    ;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement
   * @return the value of the first selected option
   */


  get value() {
    const firstSelectedChild = matchChildElement(this, isSelectedOptionPredicate);
    return firstSelectedChild ? firstSelectedChild.value : '';
  }

}
_a$9 = 49
/* size */
;
registerSubclass('select', HTMLSelectElement);
HTMLInputLabelsMixin(HTMLSelectElement); // Reflected Properties
// HTMLSelectElement.multiple => boolean, reflected attribute
// HTMLSelectElement.name => string, reflected attribute
// HTMLSelectElement.required => boolean, reflected attribute

reflectProperties([{
  multiple: [false]
}, {
  name: ['']
}, {
  required: [false]
}], HTMLSelectElement); // Implemented on HTMLElement
// HTMLSelectElement.form => HTMLFormElement, readonly
// Unimplemented Properties
// HTMLSelectElement.validation => string
// HTMLSelectElement.validity => ValidityState
// HTMLSelectElement.willValidate => boolean

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLSourceElement extends HTMLElement {}
registerSubclass('source', HTMLSourceElement); // Reflected Properties
// HTMLSourceElement.media => string, reflected attribute
// HTMLSourceElement.sizes => string, reflected attribute
// HTMLSourceElement.src => string, reflected attribute
// HTMLSourceElement.srcset => string, reflected attribute
// HTMLSourceElement.type => string, reflected attribute

reflectProperties([{
  media: ['']
}, {
  sizes: ['']
}, {
  src: ['']
}, {
  srcset: ['']
}, {
  type: ['']
}], HTMLSourceElement); // Unimplemented Properties
// HTMLSourceElement.keySystem => string

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLStyleElement extends HTMLElement {}
registerSubclass('style', HTMLStyleElement); // Reflected Properties
// HTMLStyleElement.media => string, reflected attribute
// HTMLStyleElement.type => string, reflected attribute

reflectProperties([{
  media: ['']
}, {
  type: ['']
}], HTMLStyleElement); // Unimplemented Properties
// HTMLStyleElement.disabled => boolean
// HTMLStyleElement.scoped => boolean, reflected attribute
// HTMLStyleElement.sheet => StyleSheet, read only

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLTableCellElement extends HTMLElement {
  constructor() {
    super(...arguments);
    this.headers = new DOMTokenList(HTMLTableCellElement, this, 'headers', null, null);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement
   * @return position of the cell within the parent tr, if not nested in a tr the value is -1.
   */


  get cellIndex() {
    const parent = matchNearestParent(this, tagNameConditionPredicate(['TR']));
    return parent !== null ? matchChildrenElements(parent, tagNameConditionPredicate(['TH', 'TD'])).indexOf(this) : -1;
  }

}
registerSubclass('th', HTMLTableCellElement);
registerSubclass('td', HTMLTableCellElement); // Reflected Properties
// HTMLTableCellElement.abbr => string, reflected attribute
// HTMLTableCellElement.colSpan => number, reflected attribute
// HTMLTableCellElement.rowSpan => number, reflected attribute
// HTMLTableCellElement.scope => string, reflected attribute

reflectProperties([{
  abbr: ['']
}, {
  colSpan: [1]
}, {
  rowSpan: [1]
}, {
  scope: ['']
}], HTMLTableCellElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLTableColElement extends HTMLElement {}
registerSubclass('col', HTMLTableColElement); // Reflected Properties
// HTMLTableColElement.span => number, reflected attribute

reflectProperties([{
  span: [1]
}], HTMLTableColElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const removeElement = element => element && element.remove();

const insertBeforeElementsWithTagName = (parent, element, tagNames) => {
  const insertBeforeElement = matchChildElement(parent, element => !tagNames.includes(element.tagName));

  if (insertBeforeElement) {
    parent.insertBefore(element, insertBeforeElement);
  } else {
    parent.appendChild(element);
  }
};

class HTMLTableElement extends HTMLElement {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/caption
   * @return first matching caption Element or null if none exists.
   */
  get caption() {
    return matchChildElement(this, tagNameConditionPredicate(['CAPTION']));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/caption
   * @param element new caption element to replace the existing, or become the first element child.
   */


  set caption(newElement) {
    if (newElement && newElement.tagName === 'CAPTION') {
      // If a correct object is given,
      // it is inserted in the tree as the first child of this element and the first <caption>
      // that is a child of this element is removed from the tree, if any.
      removeElement(this.caption);
      this.insertBefore(newElement, this.firstElementChild);
    }
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
   * @return first matching thead Element or null if none exists.
   */


  get tHead() {
    return matchChildElement(this, tagNameConditionPredicate(['THEAD']));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
   * @param newElement new thead element to insert in this table.
   */


  set tHead(newElement) {
    if (newElement && newElement.tagName === 'THEAD') {
      // If a correct object is given,
      // it is inserted in the tree immediately before the first element that is
      // neither a <caption>, nor a <colgroup>, or as the last child if there is no such element.
      // Additionally, the first <thead> that is a child of this element is removed from the tree, if any.
      removeElement(this.tHead);
      insertBeforeElementsWithTagName(this, newElement, ['CAPTION', 'COLGROUP']);
    }
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
   * @return first matching thead Element or null if none exists.
   */


  get tFoot() {
    return matchChildElement(this, tagNameConditionPredicate(['TFOOT']));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/tHead
   * @param newElement new tfoot element to insert in this table.
   */


  set tFoot(newElement) {
    if (newElement && newElement.tagName === 'TFOOT') {
      // If a correct object is given,
      // it is inserted in the tree immediately before the first element that is neither a <caption>,
      // a <colgroup>, nor a <thead>, or as the last child if there is no such element, and the first <tfoot> that is a child of
      // this element is removed from the tree, if any.
      removeElement(this.tFoot);
      insertBeforeElementsWithTagName(this, newElement, ['CAPTION', 'COLGROUP', 'THEAD']);
    }
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
   * @return array of 'tr' tagname elements
   */


  get rows() {
    return matchChildrenElements(this, tagNameConditionPredicate(['TR']));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
   * @return array of 'tbody' tagname elements
   */


  get tBodies() {
    return matchChildrenElements(this, tagNameConditionPredicate(['TBODY']));
  }

}
registerSubclass('table', HTMLTableElement); // Unimplemented Properties
// HTMLTableElement.sortable => boolean
// Unimplemented Methods
// HTMLTableElement.createTHead()
// HTMLTableElement.deleteTHead()
// HTMLTableElement.createTFoot()
// HTMLTableElement.deleteTFoot()
// HTMLTableElement.createCaption()
// HTMLTableElement.deleteCaption()
// HTMLTableElement.insertRow()
// HTMLTableElement.deleteRow()

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const TABLE_SECTION_TAGNAMES = 'TABLE TBODY THEAD TFOOT'.split(' ');

const indexInAncestor = (element, isValidAncestor) => {
  const parent = matchNearestParent(element, isValidAncestor); // TODO(KB): This is either a HTMLTableElement or HTMLTableSectionElement.

  return parent === null ? -1 : parent.rows.indexOf(element);
};

class HTMLTableRowElement extends HTMLElement {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
   * @return td and th elements that are children of this row.
   */
  get cells() {
    return matchChildrenElements(this, tagNameConditionPredicate(['TD', 'TH']));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
   * @return position of the row within a table, if not nested within in a table the value is -1.
   */


  get rowIndex() {
    return indexInAncestor(this, tagNameConditionPredicate(['TABLE']));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
   * @return position of the row within a parent section, if not nested directly in a section the value is -1.
   */


  get sectionRowIndex() {
    return indexInAncestor(this, tagNameConditionPredicate(TABLE_SECTION_TAGNAMES));
  }
  /**
   * Removes the cell in provided position of this row.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableRowElement
   * @param index position of the cell in the row to remove.
   */


  deleteCell(index) {
    const cell = this.cells[index];
    cell && cell.remove();
  }
  /**
   * Insert a new cell ('td') in the row at a specified position.
   * @param index position in the children to insert before.
   * @return newly inserted td element.
   */


  insertCell(index) {
    const cells = this.cells;
    const td = this.ownerDocument.createElement('td');

    if (index < 0 || index >= cells.length) {
      this.appendChild(td);
    } else {
      this.insertBefore(td, this.children[index]);
    }

    return td;
  }

}
registerSubclass('tr', HTMLTableRowElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLTableSectionElement extends HTMLElement {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
   * @return All rows (tr elements) within the table section.
   */
  get rows() {
    return matchChildrenElements(this, tagNameConditionPredicate(['TR']));
  }
  /**
   * Remove a node in a specified position from the section.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
   * @param index position in the section to remove the node of.
   */


  deleteRow(index) {
    const rows = this.rows;

    if (index >= 0 || index <= rows.length) {
      rows[index].remove();
    }
  }
  /**
   * Insert a new row ('tr') in the row at a specified position.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableSectionElement
   * @param index position in the children to insert before.
   * @return newly inserted tr element.
   */


  insertRow(index) {
    const rows = this.rows;
    const tr = this.ownerDocument.createElement('tr');

    if (index < 0 || index >= rows.length) {
      this.appendChild(tr);
    } else {
      this.insertBefore(tr, this.children[index]);
    }

    return tr;
  }

}
registerSubclass('thead', HTMLTableSectionElement);
registerSubclass('tfoot', HTMLTableSectionElement);
registerSubclass('tbody', HTMLTableSectionElement);

// <blockquote> and <q>
class HTMLTimeElement extends HTMLElement {}
registerSubclass('time', HTMLTimeElement); // Reflected Properties
// HTMLTimeElement.dateTime => string, reflected attribute

reflectProperties([{
  dateTime: ['']
}], HTMLTimeElement);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class HTMLDataListElement extends HTMLElement {
  /**
   * Getter returning option elements that are direct children of a HTMLDataListElement
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLDataListElement
   * @return Element "options" objects that are direct children.
   */
  get options() {
    return this.childNodes.filter(node => node.nodeName === 'OPTION');
  }

}
registerSubclass('datalist', HTMLDataListElement);
/**
 * HTMLDataListElement.options Read only
 * Is a HTMLCollection representing a collection of the contained option elements.
 */

/**
 * <label for="myBrowser">Choose a browser from this list:</label>
 * <input list="browsers" id="myBrowser" name="myBrowser" />
 * <datalist id="browsers">
 *   <option value="Chrome">
 *   <option value="Firefox">
 *   <option value="Internet Explorer">
 *   <option value="Opera">
 *   <option value="Safari">
 *   <option value="Microsoft Edge">
 * </datalist>
 */

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class SVGElement extends Element {
  constructor(nodeType, localName, namespaceURI, ownerDocument) {
    super(nodeType, localName, SVG_NAMESPACE, ownerDocument); // Element uppercases its nodeName, but SVG elements don't.

    this.nodeName = localName;
  }

}
registerSubclass('svg', SVGElement, SVG_NAMESPACE);

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let observing = false;

const serializeNodes = nodes => nodes.map(node => node[9
/* transferredFormat */
]);
/**
 *
 * @param mutations
 */


function serializeMutations(mutations) {
  const nodes = consume().map(node => node[8
  /* creationFormat */
  ]);
  const transferrableMutations = [];
  const type = phase === 2
  /* Mutating */
  ? 3
  /* MUTATE */
  : 2
  /* HYDRATE */
  ;
  mutations.forEach(mutation => {
    let transferable = {
      [12
      /* type */
      ]: mutation.type,
      [13
      /* target */
      ]: mutation.target[7
      /* index */
      ]
    };
    mutation.addedNodes && (transferable[14
    /* addedNodes */
    ] = serializeNodes(mutation.addedNodes));
    mutation.removedNodes && (transferable[15
    /* removedNodes */
    ] = serializeNodes(mutation.removedNodes));
    mutation.nextSibling && (transferable[17
    /* nextSibling */
    ] = mutation.nextSibling[9
    /* transferredFormat */
    ]);
    mutation.attributeName != null && (transferable[18
    /* attributeName */
    ] = store$1(mutation.attributeName));
    mutation.attributeNamespace != null && (transferable[19
    /* attributeNamespace */
    ] = store$1(mutation.attributeNamespace));
    mutation.oldValue != null && (transferable[22
    /* oldValue */
    ] = store$1(mutation.oldValue));
    mutation.propertyName && (transferable[20
    /* propertyName */
    ] = store$1(mutation.propertyName));
    mutation.value != null && (transferable[21
    /* value */
    ] = store$1(mutation.value));
    mutation.addedEvents && (transferable[23
    /* addedEvents */
    ] = mutation.addedEvents);
    mutation.removedEvents && (transferable[24
    /* removedEvents */
    ] = mutation.removedEvents);
    transferrableMutations.push(transferable);
  });
  return {
    [12
    /* type */
    ]: type,
    [41
    /* strings */
    ]: consume$1(),
    [37
    /* nodes */
    ]: nodes,
    [36
    /* mutations */
    ]: transferrableMutations
  };
}
/**
 *
 * @param incoming
 * @param postMessage
 */


function handleMutations(incoming, postMessage) {
  if (postMessage) {
    postMessage(serializeMutations(incoming)); // Only first set of mutations are sent in a "HYDRATE" message type.
    // Afterwards, we enter "MUTATING" phase and subsequent mutations are sent in "MUTATE" message type.

    set(2
    /* Mutating */
    );
  }
}
/**
 *
 * @param doc
 * @param postMessage
 */


function observe(doc, postMessage) {
  if (!observing) {
    new doc.defaultView.MutationObserver(mutations => handleMutations(mutations, postMessage)).observe(doc.body);
    observing = true;
  }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * When an event is dispatched from the main thread, it needs to be propagated in the worker thread.
 * Propagate adds an event listener to the worker global scope and uses the WorkerDOM Node.dispatchEvent
 * method to dispatch the transfered event in the worker thread.
 */

function propagate$1() {
  if (typeof addEventListener !== 'function') {
    return;
  }

  addEventListener('message', (_ref) => {
    let data = _ref.data;

    if (data[12
    /* type */
    ] !== 1
    /* EVENT */
    ) {
        return;
      }

    const event = data[39
    /* event */
    ];
    const node = get(event[7
    /* index */
    ]);

    if (node !== null) {
      const target = event[13
      /* target */
      ];
      node.dispatchEvent(Object.assign(new Event(event[12
      /* type */
      ], {
        bubbles: event[25
        /* bubbles */
        ],
        cancelable: event[26
        /* cancelable */
        ]
      }), {
        cancelBubble: event[27
        /* cancelBubble */
        ],
        defaultPrevented: event[29
        /* defaultPrevented */
        ],
        eventPhase: event[30
        /* eventPhase */
        ],
        isTrusted: event[31
        /* isTrusted */
        ],
        returnValue: event[32
        /* returnValue */
        ],
        target: get(target ? target[7
        /* index */
        ] : null),
        timeStamp: event[33
        /* timeStamp */
        ],
        scoped: event[34
        /* scoped */
        ],
        keyCode: event[35
        /* keyCode */
        ]
      }));
    }
  });
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * When an event is dispatched from the main thread, it needs to be propagated in the worker thread.
 * Propagate adds an event listener to the worker global scope and uses the WorkerDOM Node.dispatchEvent
 * method to dispatch the transfered event in the worker thread.
 */

function propagate$2() {
  if (typeof addEventListener !== 'function') {
    return;
  }

  addEventListener('message', (_ref) => {
    let data = _ref.data;

    if (data[12
    /* type */
    ] !== 4
    /* SYNC */
    ) {
        return;
      }

    const sync = data[40
    /* sync */
    ];
    const node = get(sync[7
    /* index */
    ]);

    if (node) {
      // Modify the private backing ivar of `value` property to avoid mutation/sync cycle.
      node[21
      /* value */
      ] = sync[21
      /* value */
      ];
    }
  });
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class DocumentFragment extends ParentNode {
  constructor(ownerDocument) {
    super(11
    /* DOCUMENT_FRAGMENT_NODE */
    , '#document-fragment', ownerDocument);
    this[8
    /* creationFormat */
    ] = {
      [7
      /* index */
      ]: this[7
      /* index */
      ],
      [11
      /* transferred */
      ]: 0
      /* FALSE */
      ,
      [0
      /* nodeType */
      ]: 11
      /* DOCUMENT_FRAGMENT_NODE */
      ,
      [1
      /* localOrNodeName */
      ]: store$1(this.nodeName)
    };
  }
  /**
   * @param deep boolean determines if the clone should include a recursive copy of all childNodes.
   * @return DocumentFragment containing childNode clones of the DocumentFragment requested to be cloned.
   */


  cloneNode(deep) {
    if (deep === void 0) {
      deep = false;
    }

    const clone = this.ownerDocument.createDocumentFragment();

    if (deep) {
      this.childNodes.forEach(child => clone.appendChild(child.cloneNode(deep)));
    }

    return clone;
  }

}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DOCUMENT_NAME = '#document';
class Document extends Element {
  constructor() {
    super(9
    /* DOCUMENT_NODE */
    , DOCUMENT_NAME, HTML_NAMESPACE, null); // Element uppercases its nodeName, but Document doesn't.

    this.nodeName = DOCUMENT_NAME;
    this.documentElement = this;

    this.observe = () => {
      observe(this, this.postMessageMethod);
      propagate$1();
      propagate$2();
    };

    this.defaultView = {
      document: this,
      MutationObserver,
      Document,
      Node,
      Comment,
      Text,
      Element,
      SVGElement,
      Event
    };
  }

  createElement(name) {
    return this.createElementNS(HTML_NAMESPACE, toLower(name));
  }

  createElementNS(namespaceURI, localName) {
    const constructor = NS_NAME_TO_CLASS[`${namespaceURI}:${localName}`] || HTMLElement;
    return new constructor(1
    /* ELEMENT_NODE */
    , localName, namespaceURI, this);
  }
  /**
   * Note: Unlike DOM, Event subclasses (e.g. MouseEvent) are not instantiated based on `type`.
   * @param type
   */


  createEvent(type) {
    return new Event(type, {
      bubbles: false,
      cancelable: false
    });
  }

  createTextNode(text) {
    return new Text(text, this);
  }

  createComment(text) {
    return new Comment(text, this);
  }

  createDocumentFragment() {
    return new DocumentFragment(this);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
   * @return Element with matching id attribute.
   */


  getElementById(id) {
    return matchChildElement(this.body, element => element.id === id);
  }

}
/**
 *
 * @param postMessageMethod
 */

function createDocument(postMessageMethod) {
  const doc = new Document();
  doc.postMessageMethod = postMessageMethod;
  doc.isConnected = true;
  doc.appendChild(doc.body = doc.createElement('body'));
  return doc;
}
/** Should only be used for testing. */

const documentForTesting = undefined;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function consumeInitialDOM(document, strings, hydrateableNode) {
  strings.forEach(store$1);
  (hydrateableNode[4
  /* childNodes */
  ] || []).forEach(child => document.body.appendChild(create(document, strings, child)));
  set(1
  /* Hydrating */
  );
}

function create(document, strings, skeleton) {
  switch (skeleton[0
  /* nodeType */
  ]) {
    case 3
    /* TEXT_NODE */
    :
      const text = document.createTextNode(strings[skeleton[5
      /* textContent */
      ]]);
      store(text);
      return text;

    case 8
    /* COMMENT_NODE */
    :
      const comment = document.createComment(strings[skeleton[5
      /* textContent */
      ]]);
      store(comment);
      return comment;

    default:
      const namespace = skeleton[6
      /* namespaceURI */
      ] !== undefined ? strings[skeleton[6
      /* namespaceURI */
      ]] : undefined;
      const name = strings[skeleton[1
      /* localOrNodeName */
      ]];
      const node = namespace ? document.createElementNS(namespace, name) : document.createElement(name);
      (skeleton[2
      /* attributes */
      ] || []).forEach(attribute => {
        const namespaceURI = strings[attribute[0]];

        if (namespaceURI !== 'null') {
          node.setAttributeNS(namespaceURI, strings[attribute[1]], strings[attribute[2]]);
        } else {
          node.setAttribute(strings[attribute[1]], strings[attribute[2]]);
        }
      });
      store(node);
      (skeleton[4
      /* childNodes */
      ] || []).forEach(child => node.appendChild(create(document, strings, child)));
      return node;
  }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const doc = createDocument(self.postMessage);
export const workerDOM = {
  document: doc,
  navigator: self.navigator,
  addEventListener: doc.addEventListener.bind(doc),
  removeEventListener: doc.removeEventListener.bind(doc),
  localStorage: {},
  location: {},
  url: '/',
  appendKeys,
  consumeInitialDOM,
  HTMLAnchorElement,
  HTMLButtonElement,
  HTMLDataElement,
  HTMLEmbedElement,
  HTMLFieldSetElement,
  HTMLFormElement,
  HTMLIFrameElement,
  HTMLImageElement,
  HTMLInputElement,
  HTMLLabelElement,
  HTMLLinkElement,
  HTMLMapElement,
  HTMLMeterElement,
  HTMLModElement,
  HTMLOListElement,
  HTMLOptionElement,
  HTMLProgressElement,
  HTMLQuoteElement,
  HTMLScriptElement,
  HTMLSelectElement,
  HTMLSourceElement,
  HTMLStyleElement,
  HTMLTableCellElement,
  HTMLTableColElement,
  HTMLTableElement,
  HTMLTableRowElement,
  HTMLTableSectionElement,
  HTMLTimeElement
}; // workerDOM ends up being the window object.

workerDOM.appendKeys(['color', 'background', 'backgroundPosition', 'background-size', 'backgroundSize', 'backgroundColor', 'padding', 'top', 'left']);
