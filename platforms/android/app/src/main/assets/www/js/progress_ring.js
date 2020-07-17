// progress bar for dashboard

class ProgressRing extends HTMLElement {
  constructor() {
    super();
    const parentWidth = this.parentNode.clientWidth;
    const stroke = this.getAttribute("stroke");
    const radius = this.getAttribute("radius");

    const normalizedRadius = radius - stroke * 2;
    this._circumference = normalizedRadius * 2 * Math.PI;

    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
    
      <svg
        viewBox="0 0 100 100" style="width:100%;height:100%"
       >
         
         <circle
           stroke-dasharray="${this._circumference}"
           style="stroke-dashoffset:0"
           stroke-width="${stroke}"
           fill="transparent"
           r="${normalizedRadius}"
           cx="${radius}"
           cy="${radius}"
        />
         
         <circle
           id="bar"
           stroke-dasharray="${this._circumference} ${this._circumference}"
           style="stroke-dashoffset:${this._circumference}"
           stroke-width="${stroke}"
           fill="transparent"
           r="${normalizedRadius}"
           cx="${radius}"
           cy="${radius}"
        />

        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">0%</text>
      </svg>

      <style>
        circle {
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 1s linear;
          stroke: rgb(39,19,147);
          stroke-width: 1em;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
        
        svg #bar {
                  stroke: rgb(51,162,254);
                  stroke-dashoffset: 400;
                }
        svg text {
                  fill: #fff;
                  /*stroke-width:1;
                  stroke: #fff;*/
                  font-size:1.8em;
                  font-weight:bold;
                }
        .animate{
            animation: spin 0.8s ;
        }

        @keyframes spin {
                        from {
                            transform: rotate(-90deg);
                          }
                        to {
                              transform: rotate(270deg);
                            }
                        }
      </style>
    `;
    const self = this;
    setTimeout(() => {
      self.animate();
    }, 150);
  }

  setProgress(percent) {
    const actualPercent = percent;
    percent = percent > 100 ? 100 : percent <= 0 ? 0.1 : percent;
    const offset = this._circumference - (percent / 100) * this._circumference;
    const circle = this._root.querySelector("#bar");
    circle.style.strokeDashoffset = offset;
    const text = this._root.querySelector("text");
    text.innerHTML = `${actualPercent}%`;
  }

  static get observedAttributes() {
    return ["progress"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "progress") {
      this.setProgress(newValue);
    }
  }

  animate() {
    this._root.querySelector("#bar").classList.remove("animate");
    const self = this;
    setTimeout(() => {
      self._root.querySelector("#bar").classList.add("animate");
    }, 100);
  }
}

export default ProgressRing;
