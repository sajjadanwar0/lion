# Components >> Interaction >> Switch >> Features || 20

```js script
import { html } from '@lion/core';
import { Validator } from '@lion/form-core';
import { LionSwitch } from '@lion/switch/index.js';
import '@lion/switch/lion-switch.js';
import '@lion/helpers/sb-action-logger.js';
```

## Disabled

You can disable switches.

```js preview-story
export const disabled = () => html` <lion-switch label="Label" disabled></lion-switch> `;
```

## Validation

Simple example that illustrates where validation feedback will be displayed.

```js preview-story
export const validation = () => {
  const IsTrue = class extends Validator {
    static get validatorName() {
      return 'IsTrue';
    }
    execute(value) {
      return !value.checked;
    }
    static async getMessage() {
      return "You won't get the latest news!";
    }
  };
  const tagName = 'custom-switch';
  if (!customElements.get(tagName)) {
    customElements.define(
      tagName,
      class CustomSwitch extends LionSwitch {
        static get validationTypes() {
          return [...super.validationTypes, 'info'];
        }
      },
    );
  }
  return html`
    <custom-switch
      id="newsletterCheck"
      name="newsletterCheck"
      label="Subscribe to newsletter"
      .validators="${[new IsTrue(null, { type: 'info' })]}"
    ></custom-switch>
  `;
};
```

## With checked-changed handler

You can listen for a `checked-changed` event that is fired when the switch is clicked.

```js preview-story
export const handler = () => {
  const uid = Math.random().toString(36).substr(2, 10);
  return html`
    <lion-switch
      label="Label"
      @checked-changed="${e => {
        document.getElementById(`logger-${uid}`).log(`Current value: ${e.target.checked}`);
      }}"
    >
    </lion-switch>
    <sb-action-logger id="logger-${uid}"></sb-action-logger>
  `;
};
```
