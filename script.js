import * as simpleDraw from "./elements/simple-draw.js";
simpleDraw.define("simple-draw");

// https://lospec.com/palette-list/pear36
const PALETTE = `
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
  document.body.style.setProperty("--fillColor", formData.get("color"));
  canvas.strokeSize = formData.get("size");
};

form.oninput = update;

for (let color of PALETTE) {
  let $el = document.createElement("input");
  $el.type = "radio";
  $el.value = color;
  $el.style.setProperty("--color", color);
  $el.name = "color";
  $el.ariaLabel = `pick brush color ${color}`;
  if (color === "#272736") {
    $el.checked = true;
  }
  colors.append($el);
}

update();
