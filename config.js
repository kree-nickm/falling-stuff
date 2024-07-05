document.forms.params.elements.create.addEventListener("click", event => {
  event.preventDefault();
  
  window.params = {};
  let paramList = [];
  for(let param of paramProps)
  {
    if(document.forms.params.elements[param]?.value && document.forms.params.elements[param].value != defaultParams[param])
    {
      paramList.push(`${param}=`+encodeURIComponent(document.forms.params.elements[param].value));
      window.params[param] = document.forms.params.elements[param].value;
    }
  }
  if(document.forms.params.elements.names.value)
  {
    let names = document.forms.params.elements.names.value.split(/[,;\n]/g).map(name=>name.trim()).filter(name=>name);
    paramList.push(`names=`+names.map(name=>encodeURIComponent(name)).join(","));
    window.params.names = names.join(",");
  }
  window.params = setParams(window.params);
  
  document.forms.params.elements.url.value = "https://kree-nickm.github.io/falling-stuff/source.html?" + paramList.join("&");
  window.localStorage.setItem("params", JSON.stringify(window.params));
  createItems();
  document.forms.params.elements.preview.disabled = false;
  document.forms.params.elements.load.disabled = false;
});

document.forms.params.elements.preview.addEventListener("click", event => {
  event.preventDefault();
  document.forms.params.elements.preview.disabled = true;
  startFalling();
});

document.forms.params.elements.load.addEventListener("click", event => {
  event.preventDefault();
  document.forms.params.elements.create.dispatchEvent(new Event("click"));
  window.open(document.forms.params.elements.url.value, '_blank');
});

const paramProps = ["icon","font","color","speed","yOffset","width","size","delay","delayVary","rotate","background","padding","shadowSize","shadowColor","avoid","avoidWidth","lmao"];

const defaultParams = setParams({});
for(let param of paramProps)
  if(document.forms.params.elements[param])
    document.forms.params.elements[param].placeholder = defaultParams[param];

let params = window.localStorage.getItem("params");
let paramChecks = {
  icon: value => {
    try
    {
      new URL(window.params.icon);
      return true;
    }
    catch(x)
    {
      return false;
    }
  },
};

if(params)
{
  params = JSON.parse(params);
  if(params && typeof(params) == "object")
  {
    window.params = setParams(params);
    for(let param of paramProps)
    {
      if(document.forms.params.elements[param])
      {
        document.forms.params.elements[param].placeholder = defaultParams[param];
        if(window.params[param] != defaultParams[param])
          document.forms.params.elements[param].value = window.params[param];
        else if(document.forms.params.elements[param].type == "number")
          document.forms.params.elements[param].value = defaultParams[param];
        else
          document.forms.params.elements[param].value = "";
      }
    }
    document.forms.params.elements.names.value = (window.params.names??[]).join(",");
  }
}

loaded.then(result => document.forms.params.elements.create.dispatchEvent(new Event("click")));
