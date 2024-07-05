function setParams(params)
{
  if(!params)
    params = window.params;
  try
  {
    params.icon = (new URL(params.icon)).href;
  }
  catch(x)
  {
    params.icon = "https://i.imgur.com/mgnZchn.png";
  }
  params.width = isNaN(params.width) ? 300 : parseFloat(params.width);
  params.avoid = isNaN(params.avoid) ? 0 : parseFloat(params.avoid);
  params.avoidWidth = isNaN(params.avoidWidth) ? 0 : parseFloat(params.avoidWidth);
  params.rotate = isNaN(params.rotate) ? 30 : parseFloat(params.rotate);
  params.font = params.font ? params.font : "Tahoma";
  params.color = params.color ? params.color : "#000000";
  params.shadowSize = isNaN(params.shadowSize) ? 1 : parseFloat(params.shadowSize);
  params.shadowColor = params.shadowColor ? params.shadowColor : "#ffffff";
  params.background = params.background ? params.background : "#00ff00";
  params.yOffset = isNaN(params.yOffset) ? 0 : parseFloat(params.yOffset);
  params.padding = isNaN(params.padding) ? 0 : parseFloat(params.padding);
  params.size = isNaN(params.size) ? 24 : parseFloat(params.size);
  params.speed = isNaN(params.speed) ? 100 : parseFloat(params.speed);
  params.delay = isNaN(params.delay) ? 500 : parseFloat(params.delay);
  params.delayVary = isNaN(params.delayVary) ? 1500 : parseFloat(params.delayVary);
  params.names = Array.isArray(params.names) ? params.names : params.names?.split(",") ?? ["Name","LilLongerName","ASignificantlyLongerNameHere"];
  return params;
}

function placeItem(item)
{
  if(window.params.avoid > 0 && window.params.avoid < 100)
  {
    let parts = [
      app.screen.width * (window.params.avoid - window.params.avoidWidth/2) / 100,
      app.screen.width * (window.params.avoid + window.params.avoidWidth/2) / 100,
    ];
    
    let leftright = Math.floor(Math.random()*2) + 1;
    if(parts[0] < item.width && app.screen.width-parts[1] < item.width)
      leftright = 0;
    else if(parts[0] < item.width)
      leftright = 2;
    else if(app.screen.width-parts[1] < item.width)
      leftright = 1;
    
    if(leftright == 1)
      item.x = (parts[0]-item.width) * Math.random() + item.width/2;
    else if(leftright == 2)
      item.x = (app.screen.width-parts[1]-item.width) * Math.random() + parts[1] + item.width/2;
    else
      item.x = (app.screen.width-item.width) * Math.random() + item.width/2;
  }
  else
    item.x = (app.screen.width-item.width) * Math.random() + item.width/2;
  item.y = -1 * item.height;
  let deg = 2*window.params.rotate*Math.random() - window.params.rotate;
  //item.updateTransform({rotation:deg*Math.PI/180});
  item.angle = deg;
  item.yMax = app.screen.height + window.params.delay + window.params.delayVary*Math.random();
  let children = app.stage.getChildrenByLabel("falling").slice();
  children.sort((a,b)=>b.y-a.y);
  for(let otherItem of children)
  {
    if(item != otherItem && item.getBounds().rectangle.intersects(otherItem.getBounds().rectangle))
    {
      item.y = otherItem.y - item.height - 1;
    }
  }
}

function startFalling()
{
  try
  {
    app.stage.getChildByLabel("avoid").visible = false;
    for(let item of app.stage.getChildrenByLabel("falling"))
    {
      placeItem(item);
    }
    app.ticker.add(tick);
  }
  catch(x)
  {
    let text = new PIXI.BitmapText({
      text: x,
      style: {
        fontFamily: "Arial",
        fill: "black",
        fontSize: "16pt",
        align: "center",
      },
    });
    app.stage.addChild(text);
  }
}

function tick(ticker)
{
  for(let item of app.stage.getChildrenByLabel("falling"))
  {
    item.y += ticker.deltaMS * window.params.speed / 1000;
    if(item.y > item.yMax)
      placeItem(item);
  }
}

async function init()
{
  await app.init({resizeTo:window})
  document.body.appendChild(app.canvas);
}

async function createItems()
{
  app.ticker.remove(tick);
  app.renderer.background.color.setValue(window.params.background);
  app.stage.removeChildren();
  
  let box = new PIXI.Graphics();
  box.label = "avoid";
  box.rect(app.screen.width*(window.params.avoid-window.params.avoidWidth/2)/100, 0, app.screen.width*window.params.avoidWidth/100, app.screen.height);
  box.stroke("white");
  box.fill({
    color: "black",
    alpha: 0.5,
  });
  app.stage.addChild(box);
  
  for(let name of window.params.names)
  {
    if(!name)
      continue;
    let item = new PIXI.Container();
    item.label = "falling";
    item.isFalling = true;
    
    // Create Sprite for this name.
    await PIXI.Assets.load(window.params.icon);
    let sprite = PIXI.Sprite.from(window.params.icon);
    if(sprite.width > window.params.width)
      sprite.scale.set(window.params.width / sprite.width);
    item.addChild(sprite);
    
    // Create Text for this name.
    let text = new PIXI.BitmapText({
      text: name,
      style: {
        fontFamily: window.params.font,
        stroke: window.params.shadowSize ? window.params.shadowColor : undefined,
        fill: window.params.color,
        fontSize: window.params.size,
        align: "center",
        dropShadow: {
          color: window.params.shadowColor,
          blur: window.params.shadowSize,
        },
      },
    });
    text.anchor.set(0.5);
    text.x = sprite.width / 2;
    text.y = sprite.height / 2 + window.params.yOffset;
    item.addChild(text);
    
    // Determine the size of things.
    let ogSpriteWidth = sprite.width;
    let ogTextWidth = text.width + window.params.padding;
    if(ogTextWidth > sprite.width)
      text.scale.set(sprite.width / ogTextWidth);
    
    item.pivot.set(item.width/2, item.height/2);
    item.angle = ((app.stage.getChildrenByLabel("falling").length-1) % 3) * window.params.rotate;
    app.stage.addChild(item);
    
    let nextX = item.width/2;
    let thisLine = item.height/2;
    let nextLine = item.height/2;
    for(let otherItem of app.stage.getChildrenByLabel("falling"))
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

window.params = location.search.at(0)=="?" ? location.search.slice(1).split("&").reduce((result,param) => {
  let p = param.split("=");
  if(p[1])
  {
    let arr = p[1].split(",");
    if(arr.length > 1)
      result[p[0]] = arr.map(val => decodeURIComponent(val));
    else
      result[p[0]] = decodeURIComponent(p[1]);
  }
  else
    result[p[0]] = true;
  return result;
}, {}) : {};
window.params = setParams(window.params);

const app = new PIXI.Application();

const loaded = init().then(result => location.pathname.includes("source.html") ? createItems().then(result => startFalling()) : null);
