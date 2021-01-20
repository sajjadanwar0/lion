import { css } from '@lion/core';

const applyDemoOverlayStyles = () => {
  const demoOverlaysStyle = css`
    .demo-overlay {
      color: white;
      background-color: black;
      padding: 10px;
    }

    .demo-overlay--blocking {
      background-color: lightgrey;
    }
  `;

  const styleTag = document.createElement('style');
  styleTag.setAttribute('data-demo-global-overlays', '');
  styleTag.textContent = demoOverlaysStyle.cssText;
  document.head.appendChild(styleTag);
};

applyDemoOverlayStyles();
