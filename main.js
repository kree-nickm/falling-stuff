window.params = location.search.at(0)=="?" ? location.search.slice(1).split("&").reduce((result,param) => {
  let p = param.split("=");
  result[p[0]] = p[1] ?? true;
  return result;
}, {}) : {};
setParams();

function setParams()
{
  window.params.icon = window.params.icon ?? "https://i.imgur.com/mgnZchn.png";
  window.params.width = isNaN(window.params.width) ? 30 : parseFloat(window.params.width);
  window.params.rotate = isNaN(window.params.rotate) ? 30 : parseFloat(window.params.rotate);
  window.params.font = window.params.font ?? "Tahoma";
  window.params.color = window.params.color ?? "#000000";
  window.params.yOffset = isNaN(window.params.yOffset) ? 0 : parseInt(window.params.yOffset);
  window.params.size = isNaN(window.params.size) ? 24 : parseInt(window.params.size);
  window.params.speed = isNaN(window.params.speed) ? 100 : parseInt(window.params.speed);
  window.params.delay = isNaN(window.params.delay) ? 500 : parseInt(window.params.delay);
  window.params.delayVary = isNaN(window.params.delayVary) ? 1500 : parseInt(window.params.delayVary);
  window.params.names = Array.isArray(window.params.names) ? window.params.names : window.params.names?.split(",") ?? ["Name","LilLongerName","ASignificantlyLongerNameHere"];
}

const app = new PIXI.Application();

function placeItem(item)
{
  item.x = (app.screen.width-item.width) * Math.random() + item.width/2;
  item.y = -1 * item.height;
  let deg = 2*window.params.rotate*Math.random() - window.params.rotate;
  //item.updateTransform({rotation:deg*Math.PI/180});
  item.angle = deg;
  item.yMax = app.screen.height + window.params.delay + window.params.delayVary*Math.random();
  for(let otherItem of app.stage.children.toSorted((a,b)=>b.y-a.y))
  {
    if(item != otherItem && item.getBounds().rectangle.intersects(otherItem.getBounds().rectangle))
    {
      item.y = otherItem.y - item.height - 1;
    }
  }
}

function startFalling()
{
  for(let item of app.stage.children)
  {
    placeItem(item);
  }
  app.ticker.add(tick);
}

function tick(ticker)
{
  for(let item of app.stage.children)
  {
    item.y += ticker.deltaMS * window.params.speed / 1000;
    if(item.y > item.yMax)
      placeItem(item);
  }
}

async function init()
{
  await app.init({background:"#00ff00", resizeTo:window})
  document.body.appendChild(app.canvas);
}

async function createItems()
{
  app.ticker.remove(tick);
  app.stage.removeChildren();
  for(let name of window.params.names)
  {
    if(!name)
      continue;
    let item = new PIXI.Container();
    
    // Create Sprite for this name.
    await PIXI.Assets.load(window.params.icon);
    let sprite = PIXI.Sprite.from(window.params.icon);
    if(sprite.width > app.screen.width * window.params.width / 100)
    {
      let w = app.screen.width * window.params.width / 100;
      sprite.scale.set(w / sprite.width);
    }
    item.addChild(sprite);
    
    // Create Text for this name.
    let text = new PIXI.BitmapText({
      text: name,
      style: {
        fontFamily: window.params.font,
        fill: window.params.color,
        fontSize: window.params.size,
        align: "center",
      },
    });
    text.anchor.set(0.5);
    text.x = sprite.width / 2;
    text.y = sprite.height / 2 + window.params.yOffset;
    item.addChild(text);
    
    // Determine the size of things.
    let ogSpriteWidth = sprite.width;
    let ogTextWidth = text.width;
    if(text.width > sprite.width)
      text.scale.set(sprite.width / text.width);
    
    item.pivot.set(item.width/2, item.height/2);
    item.angle = ((app.stage.children.length % 3) - 1) * window.params.rotate;
    app.stage.addChild(item);
    
    let nextX = item.width/2;
    let thisLine = item.height/2;
    let nextLine = item.height/2;
    for(let otherItem of app.stage.children)
    {
      if(item == otherItem)
        continue;
      nextX = otherItem.x + otherItem.width;
      thisLine = otherItem.y;
      nextLine = Math.max(nextLine, otherItem.y + otherItem.height);
    }
    if(nextX + item.width > app.screen.width)
    {
      item.x = 0 + item.width/2;
      item.y = nextLine;
    }
    else
    {
      item.x = nextX;
      item.y = thisLine;
    }
  }
}

init().then(result => createItems()).then(result => location.pathname.includes("source.html") ? startFalling() : null);
