import { LitElement, css, html } from 'lit-element';
import { overlaysId, OverlaysManager } from 'overlays';
import {
  overlaysId as overlaysId2,
  OverlaysManager as OverlaysManager2,
} from './node_modules/page-b/node_modules/overlays/index.js';

import 'page-a/page-a.js';
import 'page-b/page-b.js';

let compatibleManager1;
let compatibleManager2;

const blocker = document.createElement('div');
blocker.setAttribute(
  'style',
  'border: 2px solid #8d0606; margin: 10px; padding: 10px; width: 140px; text-align: center;',
);
blocker.innerText = `Shared Blocker for App`;
document.body.appendChild(blocker);

class CompatibleManager1 extends OverlaysManager {
  name = 'Compatible1 from App';

  block(sync = true) {
    super.block();
    if (sync) {
      compatibleManager2.blockBody(false);
    }
  }

  unBlock(sync = true) {
    super.unBlock();
    if (sync) {
      compatibleManager2.unBlockBody(false);
    }
  }

  _setupBlocker() {
    this.blocker = blocker;
  }
}

class CompatibleManager2 extends OverlaysManager2 {
  name = 'Compatible2 from App';

  blockBody(sync = true) {
    super.blockBody();
    if (sync) {
      compatibleManager1.block();
    }
  }

  unBlockBody(sync = true) {
    super.unBlockBody();
    if (sync) {
      compatibleManager1.unBlock();
    }
  }

  _setupBlocker() {
    this.blocker = blocker;
  }
}

compatibleManager1 = new CompatibleManager1();
compatibleManager2 = new CompatibleManager2();

class DemoApp extends LitElement {
  constructor() {
    super();
    this.page = 'A';
    this._instances = new Map();

    this.addEventListener('request-instance', ev => {
      const { key } = ev.detail;
      if (this._instances.has(key)) {
        ev.detail.instance = this._instances.get(key);
      }
    });

    this.provideInstance(overlaysId, compatibleManager1);
    this.provideInstance(overlaysId2, compatibleManager2);
  }

  provideInstance(key, instance) {
    this._instances.set(key, instance);
  }

  static get properties() {
    return {
      page: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        max-width: 680px;
        margin: 0 auto;
      }

      nav {
        padding: 0 10px 10px 10px;
      }

      button {
        border: none;
        padding: 1rem 2rem;
        background: #0069ed;
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
        text-align: center;
        transition: background 250ms ease-in-out, transform 150ms ease;
      }

      button:hover,
      button:focus {
        background: #0053ba;
      }

      button:focus {
        outline: 1px solid #fff;
        outline-offset: -4px;
      }

      button:active {
        transform: scale(0.99);
      }

      button.active {
        background: #33a43f;
      }

      h1 {
        text-align: center;
      }
    `;
  }

  render() {
    return html`
      <h1>Demo App</h1>
      <nav>
        <button class=${this.page === 'A' ? 'active' : ''} @click=${() => (this.page = 'A')}>
          Page A
        </button>
        <button class=${this.page === 'B' ? 'active' : ''} @click=${() => (this.page = 'B')}>
          Page B
        </button>
      </nav>
      ${this.page === 'A' ? html` <page-a></page-a> ` : html` <page-b></page-b> `}
    `;
  }
}

customElements.define('demo-app', DemoApp);
