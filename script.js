export function* plotLine(x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0);
  let sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let i = 0;
  while (true) {
    i += 1;
    yield { x: x0, y: y0 };

    if (x0 == x1 && y0 == y1) {
      break;
    }

    let e2 = 2 * err;
    if (e2 >= dy) {
      err += dy; /* e_xy + e_x > 0 */
      x0 += sx;
    }
    if (e2 <= dx) {
      /* e_xy + e_y < 0 */
      err += dx;
      y0 += sy;
    }
  }
}

export class CanvasDraw extends HTMLCanvasElement {
  constructor() {
    super();
    this.strokeSize = 4;
    this.captured = new Map();
    this.aspect = {
      width: 0,
      height: 0,
    };
    this.updateBounds();
    new ResizeObserver(() => this.updateBounds()).observe(this);
    this.ctx = this.getContext("2d");
    this.style.setProperty("touch-action", "none");
    this.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.setPointerCapture(e.pointerId);
      const { curr, size, offset } = this.getStrokeInfo(e);
      this.captured.set(e.pointerId, curr);
      this.ctx.fillRect(curr.x - offset, curr.y - offset, size, size);
    });
    this.addEventListener("pointermove", (e) => {
      if (this.captured.has(e.pointerId)) {
        e.preventDefault();
        const { prev, curr, size, offset } = this.getStrokeInfo(e);
        const points = plotLine(
          prev.x - offset,
          prev.y - offset,
          curr.x - offset,
          curr.y - offset
        );
        for (const point of points) {
          this.ctx.fillRect(point.x, point.y, size, size);
        }
        this.captured.set(e.pointerId, curr);
      }
    });
    this.addEventListener("pointerup", (e) => {
      e.preventDefault();
      this.releasePointerCapture(e.pointerId);
      this.captured.delete(e.pointerId);
    });
  }
  getStrokeInfo(e) {
    const size = this.strokeSize;
    const offset = size / 2;
    const prev = this.captured.get(e.pointerId);
    let x = Math.round(e.offsetX / this.aspect.width);
    let y = Math.round(e.offsetY / this.aspect.height);
    const curr = {
      x: isFinite(x) ? x : 0,
      y: isFinite(y) ? y : 0,
    };
    return {
      size,
      prev,
      curr,
      offset,
    };
  }
  connectedCallback() {
    this.updateBounds();
  }
  updateBounds() {
    let bounds = this.getBoundingClientRect();
    this.aspect = {
      width: bounds.width / this.width || 0,
      height: bounds.height / this.height || 0,
    };
  }
}
customElements.define("simple-draw", CanvasDraw, { extends: "canvas" });

// https://lospec.com/palette-list/pear36
const palette = `
  ffffeb c2c2d1 7e7e8f 606070 43434f
  66ffe3 4da6ff 4b5bab 473b78 322947
  cfff70 8fde5d 3ca370 3d6e70 323e4f
  ffe478 f2a65e ba6156 8c3f5d 5e315b
  ffb570 ff9166 eb564b b0305c 73275c
  e36956 964253 57294b 3e2347 272736
  ff6b97 bd4882 80366b 5a265e 422445
`
  .trim()
  .split(/\s+/)
  .map((e) => "#" + e);

const update = () => {
  const formData = new FormData(form);
  canvas.ctx.fillStyle = formData.get("color");
};

form.oninput = update;

for (let color of palette) {
  let $el = document.createElement("input");
  $el.type = "radio";
  $el.value = color;
  $el.style.setProperty("--color", color);
  $el.name = "color";
  $el.ariaLabel = `pick color ${color}`;
  if (color === "#272736") {
    $el.checked = true;
  }
  colors.append($el);
}

update();
