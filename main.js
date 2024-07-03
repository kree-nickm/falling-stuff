
const params = location.search.at(0)=="?" ? location.search.slice(1).split("&").reduce((result,param) => {
  let p = param.split("=");
  result[p[0]] = p[1] ?? true;
  return result;
}, {}) : {};

const icon = params.icon ?? "https://i.imgur.com/QhGQU8j.png";

(async {} => {
  // Create the application helper and add its render target to the page
  const app = new PIXI.Application();
  await app.init({background:"#00ff00", resizeTo:window})
  document.body.appendChild(app.canvas);

  // Create the sprite and add it to the stage
  await PIXI.Assets.load(icon);
  let sprite = PIXI.Sprite.from(icon);
  app.stage.addChild(sprite);

  // Add a ticker callback to move the sprite back and forth
  let elapsed = 0.0;
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime;
    sprite.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
  });
})();
