# Forms >> Fieldset >> Overview ||10

`lion-fieldset` groups multiple input fields or other fieldsets together.

We have three specific fieldset implementations:

- [lion-form](?path=/docs/forms-form-overview--main)
- [lion-checkbox-group](?path=/docs/forms-checkbox-group--main)
- [lion-radio-group](?path=/docs/forms-radio-group--main)

A native fieldset element should always have a legend-element for a11y purposes.
However, our fieldset element is not native and should not have a legend-element.
Our fieldset instead has a label attribute or you can add a label with a div- or heading-element using `slot="label"`.

## Features

- Easy retrieval of form data based on field names
- Advanced user interaction scenarios via [interaction states](?path=/docs/forms-system-interaction-states--interaction-states)
- Can have [validate](?path=/docs/forms-validation-overview--main#validate) on fieldset level and shows the validation feedback below the fieldset
- Can disable input fields on fieldset level
- Accessible out of the box

## How to use

### Installation

```bash
npm i --save @lion/fieldset
```

```js
import { LionFieldset } from '@lion/fieldset';
// or
import '@lion/fieldset/lion-fieldset.js';
```
