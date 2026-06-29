import { css, html, LitElement } from 'lit';

export class BridgeFlowTemplateLoading extends LitElement {
  static override styles = css`
    @keyframes bridgeflow-template-block-rotate {
      from {
        rotate: 0deg;
      }
      to {
        rotate: 360deg;
      }
    }

    .bridgeflow-template-block-container {
      width: 20px;
      height: 20px;
      overflow: hidden;
    }

    .bridgeflow-template-block-loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      position: relative;
      background: conic-gradient(
        rgba(30, 150, 235, 1) 90deg,
        rgba(0, 0, 0, 0.1) 90deg 360deg
      );
      border-radius: 50%;
      animation: bridgeflow-template-block-rotate 1s infinite ease-in;
    }

    .bridgeflow-template-block-loading::before {
      content: '';
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: white;
      position: absolute;
      top: 3px;
      left: 3px;
    }
  `;

  override render() {
    return html`<div class="bridgeflow-template-block-container">
      <div class="bridgeflow-template-block-loading"></div>
    </div>`;
  }
}
